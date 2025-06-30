const mediasoupClient = require("mediasoup-client");
const axios = require("axios");

let device;
let rtpCapabilities;
let producerTransport;
let consumerTransports = [];
let producer;
let consumer;
let isProducer = false;
let username;
// const baseUrl = "http://10.139.27.117:3000";
const baseUrl = "http://192.168.43.70:3000";

let audioProducer;
let videoProducer;
let producerId;
let currentRoomName;

let params = {
  // mediasoup params
  encodings: [
    {
      rid: "r0",
      maxBitrate: 100000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r1",
      maxBitrate: 300000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r2",
      maxBitrate: 900000,
      scalabilityMode: "S1T3",
    },
  ],
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
};

let videoParams = { params };
let audioParams;
let consumingTranspors = [];

export const goConsume = (user, room, onTrack) => {
  if (user !== null) {
    username = user.username;
  }
  currentRoomName = room;
  goConnect(false, onTrack);
};

export const getLocalStream = async () => {
  const sources = await window.electronAPI.getDesktopSources([
    "screen",
    "window",
  ]);

  const container = document.getElementById("sourceContainer");

  // Clear previous entries
  container.innerHTML = "";
  console.log(sources);

  sources.forEach((source) => {
    const div = document.createElement("div");
    div.classList.add("source-box");

    const img = document.createElement("img");
    img.src = source.thumbnail;
    img.classList.add("thumb");

    const label = document.createElement("p");
    label.innerText = source.name;

    div.appendChild(img);
    div.appendChild(label);
    container.appendChild(div);

    // When user clicks on a source
    div.onclick = () => selectSource(source);
  });
};

export const selectSource = async (source, user, room) => {
  if (user !== null) {
    username = user.userId;
  }
  currentRoomName = room;

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id,
        maxWidth: 1920,
        maxHeight: 1080,
      },
    },
  });

  console.log(stream);
  // INFO: test
  // audioParams = { track: stream.getAudioTracks()[0], ...audioParams };
  videoParams = { track: stream.getVideoTracks()[0], ...videoParams };

  isProducer = true;
  joinRoom();
};

const joinRoom = () => {
  axios
    .get(
      `${baseUrl}/api/stream/joinRoom?user=${username}&room=${currentRoomName}`,
    )
    .then((response) => {
      rtpCapabilities = response.data.rtpCapabilities;
      createDevice();
    })
    .catch((error) => {
      console.error("Error: ", error);
    });
};

const goConnect = (producerOrConsumer, onTrack) => {
  isProducer = producerOrConsumer;
  device === undefined ? joinRoom() : goCreateTransport(onTrack, isProducer);
};

const goCreateTransport = (onTrack) => {
  console.log("Go Create ", isProducer);
  isProducer ? createSendTransport() : createRecvTransport(onTrack);
};

const createRecvTransport = async (onTrack) => {
  axios
    .get(
      `${baseUrl}/api/stream/createTransport?user=${username}&room=${currentRoomName}&consumer=true`,
    )
    .then((response) => {
      const params = response.data.params;

      if (params.error) {
        console.error(params.error);
        return;
      }

      console.log(params);
      let consumerTransport;

      try {
        consumerTransport = device.createRecvTransport(params);
      } catch (error) {
        console.error(error);
        return;
      }

      consumerTransport.on(
        "connect",
        async ({ dtlsParameters }, callback, errback) => {
          try {
            axios
              .post(`${baseUrl}/api/stream/connectRecvTransport`, {
                serverId: params.id,
                dtlsParameters,
              })
              .then((response) => {
                if (response.status == 200) {
                  callback();
                }
              });
          } catch (error) {
            errback(error);
          }
        },
      );

      connectRecvTransport(onTrack, params.id, consumerTransport);
    });
};

const getProducer = async () => {
  axios
    .get(
      `${baseUrl}/api/stream/getProducers?user=${username}&room=${currentRoomName}`,
    )
    .then((response) => {
      producerId = response.data.id;
      console.log(response);
      console.log(producerId);
    });
};

const connectRecvTransport = async (onTrack, serverId, consumerTransport) => {
  console.log(consumerTransport);
  axios
    .get(
      `${baseUrl}/api/stream/getProducers?user=${username}&room=${currentRoomName}`,
    )
    .then((response) => {
      producerId = response.data.id;
      axios
        .post(`${baseUrl}/api/stream/consume`, {
          userId: username,
          serverId: serverId,
          remoteProducerId: producerId,
          rtpCapabilities: device.rtpCapabilities,
          roomName: currentRoomName,
        })
        .then(async (response) => {
          const params = response.data.params;

          if (params.error) {
            console.error(params.error);
            return;
          }

          console.log("Consumer Params ", params);

          const consumer = await consumerTransport.consume({
            id: params.id,
            producerId: params.producerId,
            kind: params.kind,
            rtpParameters: params.rtpParameters,
          });

          consumerTransports = [
            ...consumerTransports,
            {
              consumerTransport,
              serverId: params.id,
              producerId: producerId,
              consumer,
            },
          ];

          const { track } = consumer;

          console.log(track);
          // Call the callback with the track
          if (onTrack) {
            onTrack(track);
          }

          axios.get(
            `${baseUrl}/api/stream/resume?serverId=${params.serverConsumerId}`,
          );
        });
    });
};

const createSendTransport = () => {
  axios
    .get(
      `${baseUrl}/api/stream/createTransport?user=${username}&room=${currentRoomName}&consumer=false`,
    )
    .then((response) => {
      let params = response.data.params;
      if (params.error) {
        console.error(response.data.params.error);
        return;
      }

      console.log("Creating Send Transport");

      console.log(params);

      producerTransport = device.createSendTransport(params);

      producerTransport.on(
        "connect",
        async ({ dtlsParameters }, callback, errback) => {
          try {
            axios
              .post(`${baseUrl}/api/stream/connectTransport`, {
                userId: username,
                dtlsParameters,
              })
              .then((response) => {
                if (response.status == 200) {
                  callback();
                }
              });
          } catch (error) {
            errback(error);
          }
        },
      );

      producerTransport.on("produce", async (parameters, callback, errback) => {
        console.log(parameters);
        try {
          axios
            .post(`${baseUrl}/api/stream/produceTransport`, {
              userId: username,
              kind: parameters.kind,
              rtpParameters: parameters.rtpParameters,
              appData: parameters.appData,
            })
            .then((response) => callback(response.data.id));
          // TODO: handle producers exsist
        } catch (error) {
          errback(error);
        }
      });

      connectSendTransport();
    });
};

const connectSendTransport = async () => {
  // audioProducer = await producerTransport.produce(audioParams);
  videoProducer = await producerTransport.produce(videoParams);

  // audioProducer.on("trackended", () => {
  //   console.log("audio track ended");
  //
  //   // TODO: close audio track
  // });
  //
  // audioProducer.on("transportclose", () => {
  //   console.log("audio transport ended");
  //
  //   // TODO: close audio track
  // });

  videoProducer.on("trackended", () => {
    console.log("video track ended");

    // TODO: close video track
  });

  videoProducer.on("transportclose", () => {
    console.log("video transport ended");

    // TODO: close video track
  });
};

const getRtpCapabilities = () => {
  socket.emit("createRoom", (data) => {
    console.log(
      `Router RTP Capabilities... ${JSON.stringify(data.rtpCapabilities)}`,
    );

    // we assign to local variable and will be used when
    // loading the client Device (see createDevice above)
    rtpCapabilities = data.rtpCapabilities;

    // once we have rtpCapabilities from the Router, create Device
    createDevice();
  });
};

const createDevice = async () => {
  try {
    device = new mediasoupClient.Device();
    await device.load({
      routerRtpCapabilities: rtpCapabilities,
    });

    console.log("Device loaded successfully:", device.rtpCapabilities);

    goCreateTransport();
  } catch (error) {
    console.error("Error creating device:", error);
    if (error.name === "UnsupportedError") {
      console.warn("Browser not supported for mediasoup-client");
      alert("Browser not supported!");
    }
  }
};

export const replaceProducerTrack = async (newTrack) => {
  if (videoProducer) {
    await videoProducer.replaceTrack({ track: newTrack });
  }
};
