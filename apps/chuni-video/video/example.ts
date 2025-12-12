export const exampleDataNoVideo = {
  version: "XVRS",
  chart: {
    id: 2652,
    title: "Forsaken Tale",
    artist: "t+pazolite",
    difficulty: "master",
    score: 1010000,
    clearMark: "BRAVE",
    fc: true,
    aj: true,
    constant: 15.7,
    constantSure: true,
    rating: 17.85,
    image: "0e32fa085f54f59c.jpg",
  },
  detail: {
    comment: "เพลงนี้ดีมาก",
    rankType: "Best",
    rankInType: 2,
    rankTotal: 3,
  },
} as const;

export const exampleData = {
  ...exampleDataNoVideo,

  video: {
    url: "rickroll.webm",
    offset: 50,
  },
} as const;
