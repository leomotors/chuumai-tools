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

export const example2NoVideo = {
  version: "XVRS",
  chart: {
    id: 1086,
    title: "祈 -我ら神祖と共に歩む者なり-",
    artist: "光吉猛修 VS 穴山大輔 VS Kai VS 水野健治 VS 大国奏音",
    difficulty: "master",
    score: 1010000,
    clearMark: "BRAVE",
    fc: true,
    aj: true,
    constant: 15.7,
    constantSure: true,
    rating: 17.85,
    image: "aee87c06a25809db.jpg",
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

export const example2Data = {
  ...example2NoVideo,

  video: {
    url: "rickroll.webm",
    offset: 50,
  },
} as const;
