export type FoxL5Zone = "arms" | "ears" | "eyes" | "head" | "legs" | "snout" | "tailArray" | "torso";

export interface FoxL5PolygonDef {
  id: string;
  points: string;
  defaultFill: string;
  /** Anatomical zone from foxL5_grouped.svg (`unassigned` = not classified) */
  zone: FoxL5Zone;
}

export const FOX_L5_POLYGONS: FoxL5PolygonDef[] = [
  {
    "id": "segment_0_poly_1",
    "points": "264,187 273,186 265,195",
    "defaultFill": "#fc762d",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_2",
    "points": "273,186 264,187 276,166",
    "defaultFill": "#d7633c",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_1",
    "points": "273,186 284,213 265,195",
    "defaultFill": "#f8b542",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_1",
    "points": "321,1088 317,1100 319,1072",
    "defaultFill": "#6d2316",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_1",
    "points": "317,1100 339,1105 325,1122",
    "defaultFill": "#ffe299",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_2",
    "points": "339,1105 356,1098 325,1122",
    "defaultFill": "#ffec94",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_2",
    "points": "321,1088 339,1105 317,1100",
    "defaultFill": "#74270b",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_1",
    "points": "245,377 209,422 230,324",
    "defaultFill": "#794d40",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_2",
    "points": "209,422 199,289 230,324",
    "defaultFill": "#735233",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_2",
    "points": "309,200 284,213 273,186",
    "defaultFill": "#f2c94d",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_3",
    "points": "309,200 276,166 300,149",
    "defaultFill": "#fff87c",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_3",
    "points": "309,200 273,186 276,166",
    "defaultFill": "#f9d14e",
    "zone": "tailArray"
  },
  {
    "id": "segment_1_poly_35",
    "points": "440,1150 417,1136 442,1132",
    "defaultFill": "#0e1939",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_2",
    "points": "417,1136 440,1150 415,1229",
    "defaultFill": "#172645",
    "zone": "legs"
  },
  {
    "id": "segment_11_poly_4",
    "points": "352,1073 321,1088 319,1072",
    "defaultFill": "#ffdf77",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_4",
    "points": "339,1105 352,1073 356,1098",
    "defaultFill": "#f7a633",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_5",
    "points": "352,1073 339,1105 321,1088",
    "defaultFill": "#fdea60",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_1",
    "points": "423,141 426,150 392,178",
    "defaultFill": "#104b59",
    "zone": "ears"
  },
  {
    "id": "segment_7_poly_2",
    "points": "665,376 702,421 590,422",
    "defaultFill": "#465771",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_3",
    "points": "245,377 312,441 209,422",
    "defaultFill": "#384d6a",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_6",
    "points": "453,1209 440,1150 494,1189",
    "defaultFill": "#003453",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_7",
    "points": "440,1150 453,1209 415,1229",
    "defaultFill": "#1e3253",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_4",
    "points": "468,1242 457,1272 439,1251",
    "defaultFill": "#004a6a",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_5",
    "points": "422,1249 415,1229 439,1251",
    "defaultFill": "#294364",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_6",
    "points": "417,1270 422,1249 439,1251",
    "defaultFill": "#253b60",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_7",
    "points": "457,1272 449,1279 439,1251",
    "defaultFill": "#233a63",
    "zone": "legs"
  },
  {
    "id": "segment_3_poly_6",
    "points": "352,1073 373,1081 356,1098",
    "defaultFill": "#fea235",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_1",
    "points": "97,480 89,455 138,455",
    "defaultFill": "#b98150",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_3",
    "points": "127,586 108,531 134,516",
    "defaultFill": "#71493d",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_8",
    "points": "127,586 185,609 132,594",
    "defaultFill": "#272741",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_1",
    "points": "88,492 97,480 134,516",
    "defaultFill": "#b95e32",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_2",
    "points": "108,531 88,492 134,516",
    "defaultFill": "#b35a3c",
    "zone": "tailArray"
  },
  {
    "id": "segment_1_poly_49",
    "points": "115,766 194,738 191,797",
    "defaultFill": "#101b39",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_3",
    "points": "75,923 116,917 95,937",
    "defaultFill": "#f77632",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_8",
    "points": "446,678 458,684 441,687",
    "defaultFill": "#026383",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_1",
    "points": "458,684 446,678 461,667",
    "defaultFill": "#146e90",
    "zone": "torso"
  },
  {
    "id": "segment_0_poly_4",
    "points": "625,213 646,227 625,226",
    "defaultFill": "#f99734",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_5",
    "points": "794,770 823,703 843,720",
    "defaultFill": "#46353d",
    "zone": "tailArray"
  },
  {
    "id": "segment_1_poly_58",
    "points": "794,770 722,798 717,739",
    "defaultFill": "#101938",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_9",
    "points": "823,703 794,770 717,739",
    "defaultFill": "#2b2c41",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_9",
    "points": "406,125 423,141 392,178",
    "defaultFill": "#20606c",
    "zone": "ears"
  },
  {
    "id": "segment_5_poly_4",
    "points": "457,150 484,149 454,162",
    "defaultFill": "#584034",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_5",
    "points": "426,150 457,150 454,162",
    "defaultFill": "#593e33",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_12",
    "points": "484,149 480,197 454,162",
    "defaultFill": "#2d2a33",
    "zone": "head"
  },
  {
    "id": "segment_0_poly_5",
    "points": "616,245 644,254 628,269",
    "defaultFill": "#e26330",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_6",
    "points": "433,475 443,512 427,524",
    "defaultFill": "#58496a",
    "zone": "torso"
  },
  {
    "id": "segment_3_poly_7",
    "points": "478,475 442,428 485,464",
    "defaultFill": "#fba888",
    "zone": "torso"
  },
  {
    "id": "segment_3_poly_8",
    "points": "428,466 478,475 433,475",
    "defaultFill": "#fdc371",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_5",
    "points": "478,475 428,466 442,428",
    "defaultFill": "#ffc6ae",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_3",
    "points": "518,414 485,413 494,369",
    "defaultFill": "#3b678a",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_4",
    "points": "529,379 518,414 494,369",
    "defaultFill": "#477294",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_13",
    "points": "445,585 471,545 489,603",
    "defaultFill": "#122243",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_11",
    "points": "562,473 567,415 590,422",
    "defaultFill": "#2b5273",
    "zone": "arms"
  },
  {
    "id": "segment_5_poly_7",
    "points": "529,508 478,475 485,464",
    "defaultFill": "#5d4d67",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_12",
    "points": "597,468 562,473 590,422",
    "defaultFill": "#2e5076",
    "zone": "arms"
  },
  {
    "id": "segment_10_poly_4",
    "points": "593,266 616,245 628,269",
    "defaultFill": "#904839",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_8",
    "points": "593,266 560,255 589,255",
    "defaultFill": "#784f4b",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_9",
    "points": "593,266 640,317 560,301",
    "defaultFill": "#594c56",
    "zone": "tailArray"
  },
  {
    "id": "segment_4_poly_5",
    "points": "627,369 604,371 632,356",
    "defaultFill": "#5f6575",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_2",
    "points": "665,376 627,369 632,356",
    "defaultFill": "#9c775d",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_13",
    "points": "604,371 627,369 590,422",
    "defaultFill": "#354d71",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_14",
    "points": "627,369 665,376 590,422",
    "defaultFill": "#253a59",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_6",
    "points": "684,282 719,277 714,284",
    "defaultFill": "#ffd77b",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_7",
    "points": "719,277 684,282 724,269",
    "defaultFill": "#f2d392",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_10",
    "points": "641,263 653,298 628,269",
    "defaultFill": "#834536",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_11",
    "points": "653,298 641,263 654,256",
    "defaultFill": "#86483d",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_5",
    "points": "644,254 641,263 628,269",
    "defaultFill": "#b25534",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_6",
    "points": "641,263 644,254 654,256",
    "defaultFill": "#c1572d",
    "zone": "tailArray"
  },
  {
    "id": "segment_4_poly_6",
    "points": "312,441 320,422 342,415",
    "defaultFill": "#0f718c",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_15",
    "points": "320,422 337,405 342,415",
    "defaultFill": "#265780",
    "zone": "tailArray"
  },
  {
    "id": "segment_4_poly_7",
    "points": "426,150 432,193 392,178",
    "defaultFill": "#2b7a9b",
    "zone": "ears"
  },
  {
    "id": "segment_1_poly_66",
    "points": "432,193 426,150 454,162",
    "defaultFill": "#2a252c",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_14",
    "points": "454,197 432,193 454,162",
    "defaultFill": "#1b2540",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_15",
    "points": "471,1211 453,1209 494,1189",
    "defaultFill": "#1d3050",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_16",
    "points": "408,1259 422,1249 417,1270",
    "defaultFill": "#153f65",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_16",
    "points": "423,1279 417,1270 439,1251",
    "defaultFill": "#22385d",
    "zone": "legs"
  },
  {
    "id": "segment_4_poly_8",
    "points": "449,1279 423,1279 439,1251",
    "defaultFill": "#366e8f",
    "zone": "legs"
  },
  {
    "id": "segment_6_poly_1",
    "points": "423,1279 408,1259 417,1270",
    "defaultFill": "#67c1db",
    "zone": "legs"
  },
  {
    "id": "segment_9_poly_8",
    "points": "317,1100 306,1054 319,1072",
    "defaultFill": "#5c231c",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_9",
    "points": "306,1054 317,1059 319,1072",
    "defaultFill": "#5c1e11",
    "zone": "tailArray"
  },
  {
    "id": "segment_1_poly_71",
    "points": "430,950 483,941 464,989",
    "defaultFill": "#10172a",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_17",
    "points": "388,887 430,950 372,958",
    "defaultFill": "#112142",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_17",
    "points": "483,941 430,950 388,887",
    "defaultFill": "#086076",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_18",
    "points": "368,992 418,973 376,1028",
    "defaultFill": "#2a304a",
    "zone": "legs"
  },
  {
    "id": "segment_6_poly_2",
    "points": "418,973 430,950 464,989",
    "defaultFill": "#6aeffe",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_12",
    "points": "629,973 590,1006 591,983",
    "defaultFill": "#6d514d",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_19",
    "points": "458,684 460,776 441,687",
    "defaultFill": "#121f3f",
    "zone": "legs"
  },
  {
    "id": "segment_1_poly_72",
    "points": "472,1114 468,1100 492,1101",
    "defaultFill": "#0b1634",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_20",
    "points": "472,1114 492,1101 494,1189",
    "defaultFill": "#192e4d",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_21",
    "points": "472,1114 440,1150 442,1132",
    "defaultFill": "#0d1d3e",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_22",
    "points": "440,1150 472,1114 494,1189",
    "defaultFill": "#1c2c50",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_23",
    "points": "373,1081 458,1116 417,1136",
    "defaultFill": "#121d3d",
    "zone": "legs"
  },
  {
    "id": "segment_1_poly_73",
    "points": "417,1136 458,1116 442,1132",
    "defaultFill": "#071a38",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_24",
    "points": "458,1116 472,1114 442,1132",
    "defaultFill": "#002948",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_25",
    "points": "472,1114 458,1116 468,1100",
    "defaultFill": "#0d2547",
    "zone": "legs"
  },
  {
    "id": "segment_3_poly_9",
    "points": "62,470 89,455 97,480",
    "defaultFill": "#fdbf5a",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_6",
    "points": "88,492 62,470 97,480",
    "defaultFill": "#d86a37",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_10",
    "points": "89,455 62,470 47,464",
    "defaultFill": "#faca64",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_27",
    "points": "388,887 279,826 340,764",
    "defaultFill": "#0f2344",
    "zone": "legs"
  },
  {
    "id": "segment_9_poly_13",
    "points": "151,917 158,892 179,948",
    "defaultFill": "#6a342a",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_14",
    "points": "158,892 242,920 179,948",
    "defaultFill": "#442b2f",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_7",
    "points": "74,693 69,720 64,686",
    "defaultFill": "#954635",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_13",
    "points": "115,766 69,720 90,704",
    "defaultFill": "#483741",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_8",
    "points": "69,720 74,693 90,704",
    "defaultFill": "#894836",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_11",
    "points": "646,227 642,245 625,226",
    "defaultFill": "#ffbc47",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_12",
    "points": "642,245 616,245 625,226",
    "defaultFill": "#ffaa67",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_7",
    "points": "616,245 642,245 644,254",
    "defaultFill": "#fc813b",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_9",
    "points": "644,254 642,245 654,256",
    "defaultFill": "#cf5c30",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_8",
    "points": "642,245 646,227 654,256",
    "defaultFill": "#db5e30",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_13",
    "points": "872,634 858,643 862,618",
    "defaultFill": "#f9a22e",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_8",
    "points": "610,149 626,170 598,172",
    "defaultFill": "#fcef86",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_9",
    "points": "646,227 642,196 645,187",
    "defaultFill": "#ffe89d",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_14",
    "points": "625,213 642,196 646,227",
    "defaultFill": "#fba93d",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_15",
    "points": "586,231 625,213 625,226",
    "defaultFill": "#fd9b3a",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_10",
    "points": "840,928 854,897 876,885",
    "defaultFill": "#e6c786",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_28",
    "points": "525,878 460,776 571,763",
    "defaultFill": "#0e1d3e",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_29",
    "points": "525,878 483,941 388,887",
    "defaultFill": "#11213a",
    "zone": "legs"
  },
  {
    "id": "segment_3_poly_16",
    "points": "816,917 854,897 840,928",
    "defaultFill": "#feb147",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_11",
    "points": "816,917 840,928 833,934",
    "defaultFill": "#ffe499",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_17",
    "points": "817,937 816,917 833,934",
    "defaultFill": "#eeaa47",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_17",
    "points": "814,863 783,867 757,848",
    "defaultFill": "#481f1d",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_18",
    "points": "754,884 733,948 671,920",
    "defaultFill": "#482d34",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_19",
    "points": "733,948 754,884 746,940",
    "defaultFill": "#5d302d",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_3",
    "points": "423,141 419,132 423,123",
    "defaultFill": "#9e7152",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_12",
    "points": "406,125 419,132 423,141",
    "defaultFill": "#ffeace",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_18",
    "points": "530,127 494,213 484,149",
    "defaultFill": "#23446d",
    "zone": "ears"
  },
  {
    "id": "segment_6_poly_3",
    "points": "494,213 480,197 484,149",
    "defaultFill": "#63cee2",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_10",
    "points": "513,225 494,213 530,127",
    "defaultFill": "#3e6f90",
    "zone": "ears"
  },
  {
    "id": "segment_11_poly_13",
    "points": "486,284 510,275 500,290",
    "defaultFill": "#ffffb6",
    "zone": "eyes"
  },
  {
    "id": "segment_5_poly_14",
    "points": "510,275 486,284 476,276",
    "defaultFill": "#8a5c4f",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_19",
    "points": "516,330 542,335 545,345",
    "defaultFill": "#22466a",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_11",
    "points": "510,275 550,276 551,291",
    "defaultFill": "#476e8f",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_15",
    "points": "593,266 550,276 560,255",
    "defaultFill": "#56505e",
    "zone": "tailArray"
  },
  {
    "id": "segment_6_poly_4",
    "points": "550,276 560,301 551,291",
    "defaultFill": "#6fe8f9",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_20",
    "points": "550,276 593,266 560,301",
    "defaultFill": "#3e4a62",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_16",
    "points": "456,497 443,512 433,475",
    "defaultFill": "#8a546e",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_14",
    "points": "478,475 456,497 433,475",
    "defaultFill": "#fff5a1",
    "zone": "torso"
  },
  {
    "id": "segment_2_poly_4",
    "points": "456,497 478,475 468,494",
    "defaultFill": "#9d5b69",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_17",
    "points": "366,467 428,466 433,475",
    "defaultFill": "#4e3e59",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_15",
    "points": "442,428 470,426 485,464",
    "defaultFill": "#f6d6e1",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_12",
    "points": "511,360 529,379 494,369",
    "defaultFill": "#416f91",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_5",
    "points": "529,379 511,360 545,345",
    "defaultFill": "#63f2ff",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_31",
    "points": "475,621 445,585 489,603",
    "defaultFill": "#132748",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_32",
    "points": "463,658 461,667 456,656",
    "defaultFill": "#003758",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_33",
    "points": "491,659 458,684 461,667",
    "defaultFill": "#0a284c",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_34",
    "points": "447,556 471,545 445,585",
    "defaultFill": "#081e43",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_21",
    "points": "545,465 567,415 562,473",
    "defaultFill": "#265076",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_22",
    "points": "545,465 529,508 485,464",
    "defaultFill": "#314260",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_13",
    "points": "529,379 534,388 518,414",
    "defaultFill": "#3f7c9b",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_14",
    "points": "534,388 567,415 518,414",
    "defaultFill": "#417195",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_35",
    "points": "471,545 509,557 489,603",
    "defaultFill": "#132243",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_36",
    "points": "509,557 511,593 489,603",
    "defaultFill": "#12294b",
    "zone": "arms"
  },
  {
    "id": "segment_5_poly_18",
    "points": "478,475 472,511 468,494",
    "defaultFill": "#805870",
    "zone": "arms"
  },
  {
    "id": "segment_5_poly_19",
    "points": "529,508 472,511 478,475",
    "defaultFill": "#504b69",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_37",
    "points": "509,557 472,511 529,508",
    "defaultFill": "#182142",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_23",
    "points": "725,611 683,520 776,517",
    "defaultFill": "#3e4f6b",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_20",
    "points": "773,455 751,487 747,468",
    "defaultFill": "#7b6760",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_5",
    "points": "751,487 773,455 776,517",
    "defaultFill": "#b2774f",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_9",
    "points": "773,455 823,492 776,517",
    "defaultFill": "#ec8f4a",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_18",
    "points": "823,492 773,455 822,455",
    "defaultFill": "#faa64e",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_16",
    "points": "841,473 823,492 822,455",
    "defaultFill": "#ffe487",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_21",
    "points": "653,298 643,305 628,269",
    "defaultFill": "#714947",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_17",
    "points": "640,317 643,305 653,298",
    "defaultFill": "#cee6ea",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_6",
    "points": "643,305 593,266 628,269",
    "defaultFill": "#9a6965",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_24",
    "points": "643,305 640,317 593,266",
    "defaultFill": "#5a3233",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_10",
    "points": "684,282 681,323 653,298",
    "defaultFill": "#dc8b53",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_7",
    "points": "681,323 640,317 653,298",
    "defaultFill": "#bf7f5c",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_19",
    "points": "681,323 684,282 714,284",
    "defaultFill": "#fdca54",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_8",
    "points": "681,323 665,376 632,356",
    "defaultFill": "#c7875b",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_18",
    "points": "640,317 681,323 632,356",
    "defaultFill": "#e0c2a0",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_22",
    "points": "665,376 681,323 702,421",
    "defaultFill": "#815645",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_19",
    "points": "193,279 228,283 199,289",
    "defaultFill": "#ffe78e",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_20",
    "points": "199,289 228,283 230,324",
    "defaultFill": "#ffc75c",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_9",
    "points": "228,283 256,298 230,324",
    "defaultFill": "#d78b5a",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_21",
    "points": "228,283 193,279 186,269",
    "defaultFill": "#d5b463",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_22",
    "points": "309,200 294,229 284,213",
    "defaultFill": "#ffba45",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_11",
    "points": "320,229 294,229 309,200",
    "defaultFill": "#f97630",
    "zone": "tailArray"
  },
  {
    "id": "segment_4_poly_15",
    "points": "516,330 491,322 500,290",
    "defaultFill": "#306c86",
    "zone": "snout"
  },
  {
    "id": "segment_7_poly_24",
    "points": "337,405 377,388 342,415",
    "defaultFill": "#184771",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_25",
    "points": "415,214 432,193 454,197",
    "defaultFill": "#265984",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_26",
    "points": "415,214 454,197 454,253",
    "defaultFill": "#2f476b",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_27",
    "points": "412,222 415,214 454,253",
    "defaultFill": "#30466b",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_16",
    "points": "432,193 415,214 392,178",
    "defaultFill": "#40688b",
    "zone": "ears"
  },
  {
    "id": "segment_7_poly_28",
    "points": "394,330 373,306 411,318",
    "defaultFill": "#1f406d",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_38",
    "points": "373,306 412,290 411,318",
    "defaultFill": "#36334e",
    "zone": "snout"
  },
  {
    "id": "segment_7_poly_29",
    "points": "434,275 412,222 454,253",
    "defaultFill": "#2f4666",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_30",
    "points": "476,276 434,275 454,253",
    "defaultFill": "#364a6d",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_31",
    "points": "490,1217 492,1227 484,1238",
    "defaultFill": "#0d4463",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_32",
    "points": "471,1211 490,1217 484,1238",
    "defaultFill": "#223a5e",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_39",
    "points": "492,1227 490,1217 501,1215",
    "defaultFill": "#0b4260",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_40",
    "points": "468,1242 457,1226 484,1238",
    "defaultFill": "#01325a",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_41",
    "points": "457,1226 471,1211 484,1238",
    "defaultFill": "#013658",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_42",
    "points": "471,1211 457,1226 453,1209",
    "defaultFill": "#182e55",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_43",
    "points": "415,1229 457,1226 439,1251",
    "defaultFill": "#203353",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_44",
    "points": "453,1209 457,1226 415,1229",
    "defaultFill": "#1f3453",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_33",
    "points": "422,1249 413,1237 415,1229",
    "defaultFill": "#28486e",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_34",
    "points": "408,1259 413,1237 422,1249",
    "defaultFill": "#21476c",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_46",
    "points": "439,1286 423,1279 449,1279",
    "defaultFill": "#093155",
    "zone": "legs"
  },
  {
    "id": "segment_3_poly_23",
    "points": "330,1060 352,1073 319,1072",
    "defaultFill": "#fccb52",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_26",
    "points": "317,1059 330,1060 319,1072",
    "defaultFill": "#771f09",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_12",
    "points": "362,1045 373,1081 352,1073",
    "defaultFill": "#fb832c",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_13",
    "points": "330,1060 362,1045 352,1073",
    "defaultFill": "#f99132",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_14",
    "points": "362,1045 330,1060 355,1038",
    "defaultFill": "#f17327",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_10",
    "points": "362,1045 355,1038 376,1028",
    "defaultFill": "#a0452a",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_27",
    "points": "368,992 353,1021 333,994",
    "defaultFill": "#67352e",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_23",
    "points": "353,1021 368,992 376,1028",
    "defaultFill": "#804439",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_11",
    "points": "355,1038 353,1021 376,1028",
    "defaultFill": "#8c412e",
    "zone": "tailArray"
  },
  {
    "id": "segment_1_poly_100",
    "points": "418,973 448,1004 376,1028",
    "defaultFill": "#101733",
    "zone": "legs"
  },
  {
    "id": "segment_6_poly_6",
    "points": "448,1004 418,973 464,989",
    "defaultFill": "#66e5f4",
    "zone": "legs"
  },
  {
    "id": "segment_1_poly_101",
    "points": "401,967 418,973 368,992",
    "defaultFill": "#0f1a38",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_47",
    "points": "430,950 401,967 372,958",
    "defaultFill": "#263658",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_48",
    "points": "418,973 401,967 430,950",
    "defaultFill": "#0d375d",
    "zone": "legs"
  },
  {
    "id": "segment_1_poly_102",
    "points": "460,776 452,776 441,687",
    "defaultFill": "#0d1836",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_49",
    "points": "452,776 388,887 340,764",
    "defaultFill": "#1c3659",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_50",
    "points": "452,776 525,878 388,887",
    "defaultFill": "#0f2846",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_51",
    "points": "525,878 452,776 460,776",
    "defaultFill": "#0f1e3f",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_52",
    "points": "483,941 495,962 464,989",
    "defaultFill": "#162e50",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_53",
    "points": "521,1040 448,1004 464,989",
    "defaultFill": "#19294d",
    "zone": "legs"
  },
  {
    "id": "segment_1_poly_103",
    "points": "495,962 521,1040 464,989",
    "defaultFill": "#0e1736",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_54",
    "points": "521,1040 495,962 544,990",
    "defaultFill": "#26263e",
    "zone": "legs"
  },
  {
    "id": "segment_1_poly_104",
    "points": "468,1100 521,1040 492,1101",
    "defaultFill": "#151a37",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_55",
    "points": "448,1004 521,1040 468,1100",
    "defaultFill": "#132644",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_56",
    "points": "253,677 194,738 189,670",
    "defaultFill": "#152f52",
    "zone": "tailArray"
  },
  {
    "id": "segment_1_poly_105",
    "points": "194,738 230,754 191,797",
    "defaultFill": "#0e1c39",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_57",
    "points": "230,754 279,826 191,797",
    "defaultFill": "#1f3356",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_58",
    "points": "253,677 230,754 194,738",
    "defaultFill": "#172748",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_59",
    "points": "230,754 253,677 272,718",
    "defaultFill": "#162a4d",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_35",
    "points": "312,441 258,491 209,422",
    "defaultFill": "#324c71",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_30",
    "points": "115,685 115,766 90,704",
    "defaultFill": "#3e2e39",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_61",
    "points": "115,766 115,685 194,738",
    "defaultFill": "#252942",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_62",
    "points": "312,891 279,826 388,887",
    "defaultFill": "#111c3c",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_36",
    "points": "279,826 312,891 264,902",
    "defaultFill": "#284567",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_63",
    "points": "312,891 388,887 372,958",
    "defaultFill": "#043d5a",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_37",
    "points": "312,891 286,975 264,902",
    "defaultFill": "#304767",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_11",
    "points": "286,975 323,1006 306,1054",
    "defaultFill": "#a5765a",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_12",
    "points": "353,1021 323,1006 333,994",
    "defaultFill": "#a85c42",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_32",
    "points": "306,1054 323,1006 317,1059",
    "defaultFill": "#491d02",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_15",
    "points": "323,1006 330,1060 317,1059",
    "defaultFill": "#d66730",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_16",
    "points": "330,1060 323,1006 355,1038",
    "defaultFill": "#d85a27",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_13",
    "points": "323,1006 353,1021 355,1038",
    "defaultFill": "#bf5730",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_33",
    "points": "144,925 179,948 137,941",
    "defaultFill": "#803c29",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_34",
    "points": "144,925 151,917 179,948",
    "defaultFill": "#6e3428",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_14",
    "points": "151,917 132,906 158,892",
    "defaultFill": "#944b38",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_24",
    "points": "160,870 167,866 158,892",
    "defaultFill": "#6f515d",
    "zone": "tailArray"
  },
  {
    "id": "segment_1_poly_111",
    "points": "242,920 237,859 264,902",
    "defaultFill": "#121b3a",
    "zone": "tailArray"
  },
  {
    "id": "segment_1_poly_112",
    "points": "237,859 279,826 264,902",
    "defaultFill": "#111a39",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_64",
    "points": "279,826 237,859 191,797",
    "defaultFill": "#233758",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_20",
    "points": "843,609 864,603 862,618",
    "defaultFill": "#fefa8c",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_21",
    "points": "864,603 874,612 862,618",
    "defaultFill": "#fff17e",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_24",
    "points": "872,634 871,652 858,643",
    "defaultFill": "#eaa73e",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_65",
    "points": "678,862 633,826 722,798",
    "defaultFill": "#253858",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_66",
    "points": "633,826 525,878 571,763",
    "defaultFill": "#10284c",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_67",
    "points": "722,670 754,664 717,739",
    "defaultFill": "#192849",
    "zone": "tailArray"
  },
  {
    "id": "segment_4_poly_17",
    "points": "754,664 722,670 735,664",
    "defaultFill": "#4a8dba",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_25",
    "points": "636,185 642,196 625,213",
    "defaultFill": "#ffbd42",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_20",
    "points": "586,231 598,191 625,213",
    "defaultFill": "#ff9338",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_26",
    "points": "598,191 636,185 625,213",
    "defaultFill": "#fcde58",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_27",
    "points": "636,185 598,191 626,170",
    "defaultFill": "#f5dd61",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_25",
    "points": "560,255 583,240 589,255",
    "defaultFill": "#7a4d4a",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_26",
    "points": "586,231 583,240 560,255",
    "defaultFill": "#7d574c",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_22",
    "points": "853,883 854,897 839,884",
    "defaultFill": "#fdf384",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_45",
    "points": "828,868 853,883 839,884",
    "defaultFill": "#61251d",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_46",
    "points": "853,883 828,868 860,876",
    "defaultFill": "#522017",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_23",
    "points": "854,897 853,883 876,885",
    "defaultFill": "#fef78c",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_47",
    "points": "853,883 860,876 876,885",
    "defaultFill": "#5a2418",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_38",
    "points": "720,848 678,862 722,798",
    "defaultFill": "#2a3a5b",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_39",
    "points": "749,842 720,848 722,798",
    "defaultFill": "#283d5c",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_48",
    "points": "544,990 539,956 591,983",
    "defaultFill": "#442e3a",
    "zone": "legs"
  },
  {
    "id": "segment_1_poly_119",
    "points": "495,962 539,956 544,990",
    "defaultFill": "#10193a",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_40",
    "points": "525,878 539,956 483,941",
    "defaultFill": "#2b4568",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_41",
    "points": "539,956 495,962 483,941",
    "defaultFill": "#2d4567",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_27",
    "points": "597,964 629,973 591,983",
    "defaultFill": "#5b515c",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_49",
    "points": "539,956 597,964 591,983",
    "defaultFill": "#412d38",
    "zone": "legs"
  },
  {
    "id": "segment_11_poly_24",
    "points": "854,897 827,886 839,884",
    "defaultFill": "#fbe774",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_25",
    "points": "816,917 827,886 854,897",
    "defaultFill": "#ffe86e",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_50",
    "points": "827,886 828,868 839,884",
    "defaultFill": "#62261c",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_15",
    "points": "754,884 760,877 774,883",
    "defaultFill": "#9d4d34",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_12",
    "points": "783,867 760,877 757,848",
    "defaultFill": "#b07668",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_16",
    "points": "760,877 783,867 774,883",
    "defaultFill": "#b9654d",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_68",
    "points": "678,862 726,856 671,920",
    "defaultFill": "#2c2d42",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_28",
    "points": "726,856 754,884 671,920",
    "defaultFill": "#7c6265",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_42",
    "points": "720,848 726,856 678,862",
    "defaultFill": "#3f506c",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_29",
    "points": "726,856 760,877 754,884",
    "defaultFill": "#675058",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_30",
    "points": "760,877 726,856 757,848",
    "defaultFill": "#62555f",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_31",
    "points": "726,856 749,842 757,848",
    "defaultFill": "#53556a",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_43",
    "points": "726,856 720,848 749,842",
    "defaultFill": "#474e6a",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_13",
    "points": "419,132 414,124 423,123",
    "defaultFill": "#946657",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_26",
    "points": "414,124 419,132 406,125",
    "defaultFill": "#ffe6ce",
    "zone": "head"
  },
  {
    "id": "segment_2_poly_14",
    "points": "414,124 421,115 423,123",
    "defaultFill": "#ae917f",
    "zone": "head"
  },
  {
    "id": "segment_2_poly_15",
    "points": "421,115 414,124 406,125",
    "defaultFill": "#a08f87",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_32",
    "points": "490,132 497,119 504,125",
    "defaultFill": "#836b4f",
    "zone": "head"
  },
  {
    "id": "segment_2_poly_16",
    "points": "487,141 490,132 504,125",
    "defaultFill": "#c9a784",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_33",
    "points": "487,141 530,127 484,149",
    "defaultFill": "#49413e",
    "zone": "ears"
  },
  {
    "id": "segment_5_poly_34",
    "points": "530,127 487,141 504,125",
    "defaultFill": "#464646",
    "zone": "ears"
  },
  {
    "id": "segment_5_poly_35",
    "points": "490,132 487,141 472,118",
    "defaultFill": "#705635",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_36",
    "points": "487,141 457,150 455,129",
    "defaultFill": "#6a5132",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_37",
    "points": "457,150 487,141 484,149",
    "defaultFill": "#5d4239",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_38",
    "points": "489,123 472,118 489,114",
    "defaultFill": "#52453c",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_39",
    "points": "489,123 490,132 472,118",
    "defaultFill": "#5f4e34",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_27",
    "points": "497,119 489,123 489,114",
    "defaultFill": "#fff0e6",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_40",
    "points": "489,123 497,119 490,132",
    "defaultFill": "#886756",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_41",
    "points": "472,118 463,101 489,114",
    "defaultFill": "#4d4f4e",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_45",
    "points": "494,213 470,199 480,197",
    "defaultFill": "#174870",
    "zone": "ears"
  },
  {
    "id": "segment_8_poly_70",
    "points": "470,199 454,197 454,162",
    "defaultFill": "#1b2c46",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_71",
    "points": "480,197 470,199 454,162",
    "defaultFill": "#182947",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_20",
    "points": "454,197 470,199 454,253",
    "defaultFill": "#406e90",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_21",
    "points": "470,199 494,213 454,253",
    "defaultFill": "#43698e",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_22",
    "points": "499,224 494,213 513,225",
    "defaultFill": "#446c90",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_23",
    "points": "499,224 510,275 476,276",
    "defaultFill": "#536480",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_24",
    "points": "499,224 476,276 454,253",
    "defaultFill": "#4a6c8f",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_25",
    "points": "494,213 499,224 454,253",
    "defaultFill": "#466c90",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_26",
    "points": "510,275 499,224 524,236",
    "defaultFill": "#456385",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_27",
    "points": "499,224 513,225 524,236",
    "defaultFill": "#2f7996",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_46",
    "points": "547,306 542,335 516,330",
    "defaultFill": "#315273",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_28",
    "points": "547,306 516,330 500,290",
    "defaultFill": "#41849f",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_29",
    "points": "560,301 547,306 551,291",
    "defaultFill": "#1a7796",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_47",
    "points": "542,335 547,306 560,301",
    "defaultFill": "#33526e",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_30",
    "points": "547,306 510,275 551,291",
    "defaultFill": "#376c8c",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_31",
    "points": "510,275 547,306 500,290",
    "defaultFill": "#5a6374",
    "zone": "eyes"
  },
  {
    "id": "segment_4_poly_32",
    "points": "534,250 510,275 524,236",
    "defaultFill": "#416386",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_33",
    "points": "534,250 550,276 510,275",
    "defaultFill": "#446b8c",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_73",
    "points": "351,471 312,441 342,415",
    "defaultFill": "#102447",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_74",
    "points": "366,467 351,471 342,415",
    "defaultFill": "#062a4e",
    "zone": "arms"
  },
  {
    "id": "segment_2_poly_17",
    "points": "470,426 477,422 485,464",
    "defaultFill": "#9c7d8f",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_75",
    "points": "454,642 463,658 456,656",
    "defaultFill": "#0c2b57",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_48",
    "points": "492,623 475,621 489,603",
    "defaultFill": "#315379",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_76",
    "points": "491,659 517,698 458,684",
    "defaultFill": "#112445",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_77",
    "points": "460,776 517,698 571,763",
    "defaultFill": "#0e1c3f",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_78",
    "points": "517,698 460,776 458,684",
    "defaultFill": "#121f41",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_49",
    "points": "567,415 514,427 518,414",
    "defaultFill": "#315376",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_50",
    "points": "545,465 514,427 567,415",
    "defaultFill": "#214c6f",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_51",
    "points": "514,427 545,465 485,464",
    "defaultFill": "#38415e",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_34",
    "points": "477,422 514,427 485,464",
    "defaultFill": "#797b94",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_35",
    "points": "514,427 485,413 518,414",
    "defaultFill": "#477294",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_36",
    "points": "514,427 477,422 485,413",
    "defaultFill": "#5b7a99",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_79",
    "points": "578,356 529,379 545,345",
    "defaultFill": "#1e3658",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_52",
    "points": "578,356 534,388 529,379",
    "defaultFill": "#1c3a5c",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_80",
    "points": "542,335 578,356 545,345",
    "defaultFill": "#213556",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_81",
    "points": "578,356 542,335 560,301",
    "defaultFill": "#233354",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_53",
    "points": "640,317 578,356 560,301",
    "defaultFill": "#3e4f6b",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_82",
    "points": "604,371 578,356 632,356",
    "defaultFill": "#002a48",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_83",
    "points": "578,356 640,317 632,356",
    "defaultFill": "#003150",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_54",
    "points": "456,497 463,508 443,512",
    "defaultFill": "#2f5a7a",
    "zone": "arms"
  },
  {
    "id": "segment_4_poly_37",
    "points": "463,508 456,497 468,494",
    "defaultFill": "#547898",
    "zone": "arms"
  },
  {
    "id": "segment_4_poly_38",
    "points": "472,511 463,508 468,494",
    "defaultFill": "#41607d",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_55",
    "points": "639,577 725,611 643,611",
    "defaultFill": "#354f70",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_56",
    "points": "639,577 683,520 725,611",
    "defaultFill": "#374f71",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_28",
    "points": "849,469 822,455 862,464",
    "defaultFill": "#facb61",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_29",
    "points": "849,469 841,473 822,455",
    "defaultFill": "#f9c356",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_57",
    "points": "683,520 712,497 776,517",
    "defaultFill": "#3d526f",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_42",
    "points": "159,487 189,495 134,516",
    "defaultFill": "#454150",
    "zone": "tailArray"
  },
  {
    "id": "segment_4_poly_39",
    "points": "189,495 159,487 165,468",
    "defaultFill": "#62697b",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_43",
    "points": "165,468 159,487 138,455",
    "defaultFill": "#6f6063",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_28",
    "points": "159,487 97,480 138,455",
    "defaultFill": "#f7caab",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_18",
    "points": "97,480 159,487 134,516",
    "defaultFill": "#c57c4f",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_19",
    "points": "256,298 271,318 230,324",
    "defaultFill": "#be8057",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_20",
    "points": "271,318 275,325 230,324",
    "defaultFill": "#b67e5b",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_84",
    "points": "331,355 377,388 337,405",
    "defaultFill": "#11274c",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_17",
    "points": "276,241 294,229 289,269",
    "defaultFill": "#bf5032",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_18",
    "points": "294,229 315,259 289,269",
    "defaultFill": "#aa4e35",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_19",
    "points": "315,259 321,269 289,269",
    "defaultFill": "#98513d",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_29",
    "points": "480,297 486,284 500,290",
    "defaultFill": "#fff8a7",
    "zone": "eyes"
  },
  {
    "id": "segment_5_poly_44",
    "points": "491,322 480,297 500,290",
    "defaultFill": "#6c6672",
    "zone": "eyes"
  },
  {
    "id": "segment_6_poly_9",
    "points": "507,347 491,322 516,330",
    "defaultFill": "#74e4f8",
    "zone": "snout"
  },
  {
    "id": "segment_6_poly_10",
    "points": "507,347 516,330 545,345",
    "defaultFill": "#64f2fe",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_40",
    "points": "511,360 507,347 545,345",
    "defaultFill": "#2883a0",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_85",
    "points": "394,414 366,467 342,415",
    "defaultFill": "#102041",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_58",
    "points": "377,388 394,414 342,415",
    "defaultFill": "#1b3860",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_86",
    "points": "366,467 394,414 428,466",
    "defaultFill": "#272a49",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_59",
    "points": "489,1209 496,1197 501,1215",
    "defaultFill": "#1e4767",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_60",
    "points": "490,1217 489,1209 501,1215",
    "defaultFill": "#194262",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_61",
    "points": "489,1209 490,1217 471,1211",
    "defaultFill": "#213e60",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_87",
    "points": "496,1197 489,1209 494,1189",
    "defaultFill": "#153c5b",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_88",
    "points": "489,1209 471,1211 494,1189",
    "defaultFill": "#183150",
    "zone": "legs"
  },
  {
    "id": "segment_4_poly_41",
    "points": "457,1236 468,1242 439,1251",
    "defaultFill": "#368aa6",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_89",
    "points": "457,1226 457,1236 439,1251",
    "defaultFill": "#123752",
    "zone": "legs"
  },
  {
    "id": "segment_6_poly_11",
    "points": "457,1236 457,1226 468,1242",
    "defaultFill": "#5cbad6",
    "zone": "legs"
  },
  {
    "id": "segment_0_poly_21",
    "points": "362,1045 386,1053 373,1081",
    "defaultFill": "#ff9c35",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_90",
    "points": "386,1053 448,1004 468,1100",
    "defaultFill": "#223657",
    "zone": "legs"
  },
  {
    "id": "segment_1_poly_124",
    "points": "386,1053 458,1116 373,1081",
    "defaultFill": "#201e36",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_91",
    "points": "458,1116 386,1053 468,1100",
    "defaultFill": "#1d3453",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_92",
    "points": "401,967 375,966 372,958",
    "defaultFill": "#122a4e",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_93",
    "points": "375,966 401,967 368,992",
    "defaultFill": "#10213f",
    "zone": "legs"
  },
  {
    "id": "segment_3_poly_30",
    "points": "562,1076 559,1099 545,1087",
    "defaultFill": "#f1b241",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_30",
    "points": "589,1110 590,1123 579,1110",
    "defaultFill": "#fff892",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_31",
    "points": "592,1099 589,1110 579,1110",
    "defaultFill": "#ffe894",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_20",
    "points": "589,1110 592,1099 590,1123",
    "defaultFill": "#a14923",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_56",
    "points": "591,1085 583,1061 595,1067",
    "defaultFill": "#6f2518",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_31",
    "points": "591,1085 562,1076 570,1063",
    "defaultFill": "#ffdb54",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_32",
    "points": "583,1061 591,1085 570,1063",
    "defaultFill": "#fcd556",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_57",
    "points": "608,1058 591,1085 595,1067",
    "defaultFill": "#5d201b",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_58",
    "points": "591,1085 608,1058 592,1099",
    "defaultFill": "#4e1e1e",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_33",
    "points": "591,1085 559,1099 562,1076",
    "defaultFill": "#ffe665",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_59",
    "points": "591,1085 592,1099 579,1110",
    "defaultFill": "#6e2300",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_32",
    "points": "559,1099 591,1085 579,1110",
    "defaultFill": "#fff266",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_94",
    "points": "303,743 230,754 272,718",
    "defaultFill": "#192847",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_95",
    "points": "230,754 303,743 279,826",
    "defaultFill": "#223556",
    "zone": "tailArray"
  },
  {
    "id": "segment_1_poly_127",
    "points": "279,826 303,743 340,764",
    "defaultFill": "#0c1534",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_96",
    "points": "303,743 336,754 340,764",
    "defaultFill": "#0e2142",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_97",
    "points": "475,621 429,594 445,585",
    "defaultFill": "#122546",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_98",
    "points": "454,642 429,594 475,621",
    "defaultFill": "#122546",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_99",
    "points": "303,743 354,691 336,754",
    "defaultFill": "#0d1f43",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_100",
    "points": "253,677 354,691 272,718",
    "defaultFill": "#0c1b3c",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_101",
    "points": "354,691 303,743 272,718",
    "defaultFill": "#172a4b",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_45",
    "points": "220,545 127,586 134,516",
    "defaultFill": "#523d46",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_103",
    "points": "127,586 220,545 185,609",
    "defaultFill": "#2d334b",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_62",
    "points": "189,495 220,545 134,516",
    "defaultFill": "#3c4d69",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_63",
    "points": "220,545 189,495 199,498",
    "defaultFill": "#205273",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_21",
    "points": "102,682 115,685 90,704",
    "defaultFill": "#924d3e",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_105",
    "points": "194,738 157,664 189,670",
    "defaultFill": "#182849",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_64",
    "points": "115,685 157,664 194,738",
    "defaultFill": "#2c3a57",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_46",
    "points": "157,664 115,685 114,667",
    "defaultFill": "#56424d",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_47",
    "points": "104,645 157,664 114,667",
    "defaultFill": "#724b46",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_22",
    "points": "74,693 89,676 90,704",
    "defaultFill": "#e46530",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_22",
    "points": "89,676 102,682 90,704",
    "defaultFill": "#a25038",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_34",
    "points": "58,654 80,659 67,669",
    "defaultFill": "#faa33c",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_23",
    "points": "58,654 41,660 51,643",
    "defaultFill": "#ec561b",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_35",
    "points": "41,660 41,628 51,643",
    "defaultFill": "#ffbf65",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_107",
    "points": "330,979 312,891 372,958",
    "defaultFill": "#3b2f3d",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_65",
    "points": "312,891 330,979 286,975",
    "defaultFill": "#465167",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_48",
    "points": "375,966 330,979 372,958",
    "defaultFill": "#4e3844",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_23",
    "points": "323,1006 330,979 333,994",
    "defaultFill": "#8b5145",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_49",
    "points": "330,979 323,1006 286,975",
    "defaultFill": "#6f4d4e",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_63",
    "points": "330,979 368,992 333,994",
    "defaultFill": "#5d302b",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_64",
    "points": "330,979 375,966 368,992",
    "defaultFill": "#57373a",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_24",
    "points": "128,928 137,941 95,937",
    "defaultFill": "#fd8e32",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_25",
    "points": "116,917 128,928 95,937",
    "defaultFill": "#dd672a",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_50",
    "points": "135,891 138,882 158,892",
    "defaultFill": "#774d4e",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_26",
    "points": "132,906 135,891 158,892",
    "defaultFill": "#f76f35",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_24",
    "points": "138,882 135,891 131,865",
    "defaultFill": "#b65a41",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_27",
    "points": "144,925 136,922 151,917",
    "defaultFill": "#f58836",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_28",
    "points": "136,922 132,906 151,917",
    "defaultFill": "#f6672f",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_25",
    "points": "136,922 144,925 137,941",
    "defaultFill": "#9b4224",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_26",
    "points": "128,928 136,922 137,941",
    "defaultFill": "#a44728",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_29",
    "points": "132,906 136,922 116,917",
    "defaultFill": "#f76929",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_27",
    "points": "136,922 128,928 116,917",
    "defaultFill": "#b95524",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_51",
    "points": "160,870 155,848 167,866",
    "defaultFill": "#6a5661",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_52",
    "points": "138,882 149,873 158,892",
    "defaultFill": "#734b4b",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_53",
    "points": "149,873 160,870 158,892",
    "defaultFill": "#745052",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_28",
    "points": "149,873 138,882 131,865",
    "defaultFill": "#a85c4e",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_54",
    "points": "155,848 149,873 131,865",
    "defaultFill": "#8b5854",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_55",
    "points": "149,873 155,848 160,870",
    "defaultFill": "#71585b",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_56",
    "points": "155,848 174,862 167,866",
    "defaultFill": "#625461",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_57",
    "points": "174,862 155,848 162,842",
    "defaultFill": "#535061",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_108",
    "points": "174,862 237,859 242,920",
    "defaultFill": "#322b3b",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_66",
    "points": "174,862 162,842 191,797",
    "defaultFill": "#2a395a",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_109",
    "points": "237,859 174,862 191,797",
    "defaultFill": "#2a3855",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_58",
    "points": "174,862 242,920 158,892",
    "defaultFill": "#633f3f",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_59",
    "points": "167,866 174,862 158,892",
    "defaultFill": "#66555d",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_36",
    "points": "51,902 59,900 64,913",
    "defaultFill": "#e1be7a",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_33",
    "points": "59,900 72,884 64,913",
    "defaultFill": "#fffa8a",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_37",
    "points": "84,885 75,923 64,913",
    "defaultFill": "#e9a03a",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_34",
    "points": "72,884 84,885 64,913",
    "defaultFill": "#fef57e",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_65",
    "points": "84,885 72,884 89,871",
    "defaultFill": "#7a2a13",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_35",
    "points": "871,624 872,634 862,618",
    "defaultFill": "#ffe37a",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_29",
    "points": "874,612 871,624 862,618",
    "defaultFill": "#ae7d38",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_30",
    "points": "821,679 823,703 809,679",
    "defaultFill": "#9e503c",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_31",
    "points": "823,703 835,694 843,720",
    "defaultFill": "#8a4d38",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_32",
    "points": "821,679 835,694 823,703",
    "defaultFill": "#b35426",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_33",
    "points": "835,694 821,679 831,678",
    "defaultFill": "#c05626",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_110",
    "points": "633,826 684,755 722,798",
    "defaultFill": "#1f3658",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_111",
    "points": "722,798 684,755 717,739",
    "defaultFill": "#101e41",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_112",
    "points": "684,755 641,718 717,739",
    "defaultFill": "#0e1b3d",
    "zone": "tailArray"
  },
  {
    "id": "segment_1_poly_132",
    "points": "609,743 633,826 571,763",
    "defaultFill": "#0f1a36",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_113",
    "points": "684,755 609,743 641,718",
    "defaultFill": "#172a4a",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_114",
    "points": "609,743 684,755 633,826",
    "defaultFill": "#203455",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_67",
    "points": "754,664 795,669 717,739",
    "defaultFill": "#2f3d5a",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_68",
    "points": "795,669 823,703 717,739",
    "defaultFill": "#4b5064",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_60",
    "points": "823,703 795,669 809,679",
    "defaultFill": "#884f46",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_115",
    "points": "641,718 657,677 717,739",
    "defaultFill": "#172d52",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_116",
    "points": "657,677 722,670 717,739",
    "defaultFill": "#102c51",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_69",
    "points": "725,611 716,625 643,611",
    "defaultFill": "#364e70",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_36",
    "points": "626,170 597,182 598,172",
    "defaultFill": "#ffefa1",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_37",
    "points": "598,191 597,182 626,170",
    "defaultFill": "#f4da79",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_30",
    "points": "609,241 583,240 586,231",
    "defaultFill": "#f76d2e",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_34",
    "points": "616,245 609,241 625,226",
    "defaultFill": "#c8542b",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_31",
    "points": "609,241 586,231 625,226",
    "defaultFill": "#fe752d",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_32",
    "points": "583,240 609,241 589,255",
    "defaultFill": "#f86a2c",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_35",
    "points": "609,241 593,266 589,255",
    "defaultFill": "#cf5b34",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_36",
    "points": "593,266 609,241 616,245",
    "defaultFill": "#924a3b",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_121",
    "points": "633,826 619,894 525,878",
    "defaultFill": "#0e1d3e",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_122",
    "points": "619,894 539,956 525,878",
    "defaultFill": "#122c4d",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_123",
    "points": "619,894 597,964 539,956",
    "defaultFill": "#2a2939",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_70",
    "points": "619,894 633,826 678,862",
    "defaultFill": "#05516b",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_71",
    "points": "597,964 619,894 629,973",
    "defaultFill": "#3d4d67",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_68",
    "points": "786,939 733,948 746,940",
    "defaultFill": "#7d3622",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_69",
    "points": "754,884 760,917 746,940",
    "defaultFill": "#6c3018",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_38",
    "points": "817,890 827,886 816,917",
    "defaultFill": "#f9c851",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_39",
    "points": "779,907 817,890 816,917",
    "defaultFill": "#ffb246",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_70",
    "points": "817,890 783,867 814,863",
    "defaultFill": "#5a2712",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_71",
    "points": "828,868 817,890 814,863",
    "defaultFill": "#562119",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_72",
    "points": "827,886 817,890 828,868",
    "defaultFill": "#6e281c",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_21",
    "points": "463,120 463,101 472,118",
    "defaultFill": "#a88e91",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_38",
    "points": "463,120 487,141 455,129",
    "defaultFill": "#ffeac2",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_61",
    "points": "487,141 463,120 472,118",
    "defaultFill": "#675139",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_62",
    "points": "421,115 442,118 423,123",
    "defaultFill": "#5b4a42",
    "zone": "head"
  },
  {
    "id": "segment_2_poly_22",
    "points": "442,118 463,120 455,129",
    "defaultFill": "#a1827d",
    "zone": "head"
  },
  {
    "id": "segment_2_poly_23",
    "points": "463,120 442,118 463,101",
    "defaultFill": "#81767c",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_131",
    "points": "351,471 316,460 312,441",
    "defaultFill": "#112d54",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_132",
    "points": "454,642 472,653 463,658",
    "defaultFill": "#0c2450",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_133",
    "points": "491,659 472,653 483,650",
    "defaultFill": "#00365b",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_134",
    "points": "463,658 472,653 461,667",
    "defaultFill": "#003756",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_13",
    "points": "472,653 491,659 461,667",
    "defaultFill": "#6bd8ef",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_135",
    "points": "480,630 492,623 483,650",
    "defaultFill": "#12254f",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_136",
    "points": "492,623 480,630 475,621",
    "defaultFill": "#132c55",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_137",
    "points": "472,653 480,630 483,650",
    "defaultFill": "#002d48",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_138",
    "points": "480,630 454,642 475,621",
    "defaultFill": "#09274d",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_139",
    "points": "480,630 472,653 454,642",
    "defaultFill": "#003353",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_72",
    "points": "511,593 512,627 489,603",
    "defaultFill": "#324f71",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_73",
    "points": "512,627 492,623 489,603",
    "defaultFill": "#315275",
    "zone": "arms"
  },
  {
    "id": "segment_4_poly_42",
    "points": "534,388 576,408 567,415",
    "defaultFill": "#437da3",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_140",
    "points": "578,356 576,408 534,388",
    "defaultFill": "#0f2c4c",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_141",
    "points": "576,408 578,356 604,371",
    "defaultFill": "#142448",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_142",
    "points": "576,408 604,371 590,422",
    "defaultFill": "#0f2b50",
    "zone": "tailArray"
  },
  {
    "id": "segment_4_poly_43",
    "points": "567,415 576,408 590,422",
    "defaultFill": "#457ba1",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_143",
    "points": "550,505 539,518 529,508",
    "defaultFill": "#102d55",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_74",
    "points": "539,518 550,505 564,536",
    "defaultFill": "#15426b",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_144",
    "points": "539,518 509,557 529,508",
    "defaultFill": "#111f42",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_145",
    "points": "539,518 564,536 546,569",
    "defaultFill": "#132f54",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_75",
    "points": "509,557 539,518 546,569",
    "defaultFill": "#19607e",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_146",
    "points": "545,465 549,497 529,508",
    "defaultFill": "#132347",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_147",
    "points": "549,497 550,505 529,508",
    "defaultFill": "#102951",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_148",
    "points": "549,497 545,465 562,473",
    "defaultFill": "#0f1d42",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_76",
    "points": "463,508 454,523 443,512",
    "defaultFill": "#29547e",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_77",
    "points": "454,523 463,508 472,511",
    "defaultFill": "#285c84",
    "zone": "arms"
  },
  {
    "id": "segment_5_poly_63",
    "points": "723,493 751,487 776,517",
    "defaultFill": "#493f4a",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_78",
    "points": "712,497 723,493 776,517",
    "defaultFill": "#475369",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_64",
    "points": "751,487 723,493 747,468",
    "defaultFill": "#67656a",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_65",
    "points": "271,318 266,304 289,269",
    "defaultFill": "#50323a",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_39",
    "points": "266,304 271,318 256,298",
    "defaultFill": "#cceae8",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_73",
    "points": "271,318 326,281 275,325",
    "defaultFill": "#3e2a36",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_66",
    "points": "321,269 326,281 289,269",
    "defaultFill": "#835148",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_67",
    "points": "326,281 271,318 289,269",
    "defaultFill": "#634a4d",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_149",
    "points": "331,355 326,281 357,299",
    "defaultFill": "#243151",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_79",
    "points": "326,281 331,355 275,325",
    "defaultFill": "#3d4760",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_68",
    "points": "348,254 326,281 321,269",
    "defaultFill": "#634e57",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_150",
    "points": "284,370 312,441 245,377",
    "defaultFill": "#1e2d4c",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_80",
    "points": "284,370 320,422 312,441",
    "defaultFill": "#2c4a6c",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_151",
    "points": "366,334 331,355 357,299",
    "defaultFill": "#213455",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_81",
    "points": "366,334 373,306 394,330",
    "defaultFill": "#264e71",
    "zone": "snout"
  },
  {
    "id": "segment_0_poly_33",
    "points": "294,229 285,228 284,213",
    "defaultFill": "#fe8830",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_34",
    "points": "276,241 285,228 294,229",
    "defaultFill": "#d75b28",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_35",
    "points": "267,243 256,258 265,195",
    "defaultFill": "#e06833",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_36",
    "points": "284,213 267,243 265,195",
    "defaultFill": "#fe9134",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_37",
    "points": "285,228 267,243 284,213",
    "defaultFill": "#ff7b30",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_38",
    "points": "267,243 285,228 276,241",
    "defaultFill": "#ff7234",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_69",
    "points": "256,258 265,262 256,298",
    "defaultFill": "#7c4b44",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_40",
    "points": "396,273 422,282 412,290",
    "defaultFill": "#feffb9",
    "zone": "eyes"
  },
  {
    "id": "segment_5_poly_70",
    "points": "373,306 396,273 412,290",
    "defaultFill": "#4a3e4c",
    "zone": "eyes"
  },
  {
    "id": "segment_8_poly_152",
    "points": "434,275 396,273 412,222",
    "defaultFill": "#292d48",
    "zone": "head"
  },
  {
    "id": "segment_2_poly_24",
    "points": "422,282 396,273 434,275",
    "defaultFill": "#946959",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_71",
    "points": "348,254 322,239 320,229",
    "defaultFill": "#895548",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_39",
    "points": "322,239 294,229 320,229",
    "defaultFill": "#f9672c",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_40",
    "points": "322,239 315,259 294,229",
    "defaultFill": "#fd632d",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_72",
    "points": "323,250 348,254 321,269",
    "defaultFill": "#78534d",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_41",
    "points": "315,259 323,250 321,269",
    "defaultFill": "#d66942",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_73",
    "points": "323,250 322,239 348,254",
    "defaultFill": "#86574d",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_42",
    "points": "322,239 323,250 315,259",
    "defaultFill": "#ee6b37",
    "zone": "tailArray"
  },
  {
    "id": "segment_4_poly_45",
    "points": "474,303 491,322 465,339",
    "defaultFill": "#4d6a8a",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_46",
    "points": "474,303 480,297 491,322",
    "defaultFill": "#5b6b82",
    "zone": "snout"
  },
  {
    "id": "segment_5_poly_74",
    "points": "486,284 470,295 476,276",
    "defaultFill": "#685654",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_75",
    "points": "480,297 470,295 486,284",
    "defaultFill": "#775249",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_76",
    "points": "474,303 470,295 480,297",
    "defaultFill": "#5c555d",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_82",
    "points": "470,295 434,275 476,276",
    "defaultFill": "#354a69",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_47",
    "points": "491,322 487,342 465,339",
    "defaultFill": "#46688b",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_48",
    "points": "507,347 487,342 491,322",
    "defaultFill": "#43a1bb",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_49",
    "points": "454,356 462,350 467,362",
    "defaultFill": "#2a718f",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_50",
    "points": "487,342 462,350 465,339",
    "defaultFill": "#476d91",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_51",
    "points": "462,350 487,342 467,362",
    "defaultFill": "#426a8e",
    "zone": "snout"
  },
  {
    "id": "segment_7_poly_83",
    "points": "424,341 394,330 411,318",
    "defaultFill": "#1d3f6d",
    "zone": "snout"
  },
  {
    "id": "segment_2_poly_25",
    "points": "428,466 434,423 442,428",
    "defaultFill": "#9e7f8f",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_77",
    "points": "412,290 431,297 411,318",
    "defaultFill": "#56474e",
    "zone": "eyes"
  },
  {
    "id": "segment_11_poly_41",
    "points": "422,282 431,297 412,290",
    "defaultFill": "#fffdb8",
    "zone": "eyes"
  },
  {
    "id": "segment_4_poly_52",
    "points": "431,297 470,295 474,303",
    "defaultFill": "#4e6d8c",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_78",
    "points": "431,297 422,282 434,275",
    "defaultFill": "#6b4940",
    "zone": "eyes"
  },
  {
    "id": "segment_7_poly_84",
    "points": "470,295 431,297 434,275",
    "defaultFill": "#384869",
    "zone": "head"
  },
  {
    "id": "segment_0_poly_43",
    "points": "381,1041 362,1045 376,1028",
    "defaultFill": "#f76c29",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_44",
    "points": "381,1041 386,1053 362,1045",
    "defaultFill": "#f9832b",
    "zone": "tailArray"
  },
  {
    "id": "segment_1_poly_145",
    "points": "448,1004 381,1041 376,1028",
    "defaultFill": "#151b35",
    "zone": "legs"
  },
  {
    "id": "segment_1_poly_146",
    "points": "386,1053 381,1041 448,1004",
    "defaultFill": "#141936",
    "zone": "legs"
  },
  {
    "id": "segment_0_poly_45",
    "points": "559,1099 550,1102 545,1087",
    "defaultFill": "#f55519",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_75",
    "points": "590,1123 550,1102 579,1110",
    "defaultFill": "#732e0d",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_76",
    "points": "550,1102 559,1099 579,1110",
    "defaultFill": "#8c2d11",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_77",
    "points": "583,1061 602,1050 595,1067",
    "defaultFill": "#662217",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_46",
    "points": "602,1050 608,1058 595,1067",
    "defaultFill": "#ed6636",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_37",
    "points": "602,1050 590,1006 629,973",
    "defaultFill": "#a65f43",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_40",
    "points": "562,1076 559,1065 570,1063",
    "defaultFill": "#eab63c",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_47",
    "points": "559,1065 552,1044 570,1063",
    "defaultFill": "#df9238",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_48",
    "points": "558,1036 583,1061 570,1063",
    "defaultFill": "#fc862f",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_49",
    "points": "552,1044 558,1036 570,1063",
    "defaultFill": "#de8938",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_41",
    "points": "558,1036 602,1050 583,1061",
    "defaultFill": "#fba149",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_153",
    "points": "461,667 442,666 456,656",
    "defaultFill": "#002e54",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_154",
    "points": "446,678 442,666 461,667",
    "defaultFill": "#004163",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_85",
    "points": "197,626 186,619 185,609",
    "defaultFill": "#2a436b",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_38",
    "points": "115,685 109,674 114,667",
    "defaultFill": "#90573a",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_50",
    "points": "102,682 109,674 115,685",
    "defaultFill": "#fe8e38",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_39",
    "points": "89,676 109,674 102,682",
    "defaultFill": "#cf5e32",
    "zone": "tailArray"
  },
  {
    "id": "segment_6_poly_14",
    "points": "157,664 175,663 189,670",
    "defaultFill": "#65b3e3",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_42",
    "points": "80,659 80,669 67,669",
    "defaultFill": "#ffb44f",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_40",
    "points": "67,669 80,669 64,686",
    "defaultFill": "#9f4507",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_41",
    "points": "80,669 74,693 64,686",
    "defaultFill": "#a8411e",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_51",
    "points": "80,669 89,676 74,693",
    "defaultFill": "#f87032",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_52",
    "points": "104,645 87,654 99,635",
    "defaultFill": "#e4733b",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_53",
    "points": "87,654 80,669 80,659",
    "defaultFill": "#ff853f",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_54",
    "points": "80,669 87,654 89,676",
    "defaultFill": "#f17037",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_55",
    "points": "87,654 109,674 89,676",
    "defaultFill": "#d96031",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_56",
    "points": "99,635 87,654 79,626",
    "defaultFill": "#e8813c",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_42",
    "points": "87,654 104,645 114,667",
    "defaultFill": "#c36036",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_43",
    "points": "109,674 87,654 114,667",
    "defaultFill": "#ad5b35",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_57",
    "points": "48,668 58,654 67,669",
    "defaultFill": "#ff7031",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_58",
    "points": "58,654 48,668 41,660",
    "defaultFill": "#fd6229",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_59",
    "points": "48,668 67,669 64,686",
    "defaultFill": "#fa712b",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_44",
    "points": "69,720 48,668 64,686",
    "defaultFill": "#ba5738",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_43",
    "points": "58,654 60,645 80,659",
    "defaultFill": "#ffc44e",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_44",
    "points": "87,654 60,645 79,626",
    "defaultFill": "#ffc958",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_45",
    "points": "60,645 87,654 80,659",
    "defaultFill": "#fdb348",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_46",
    "points": "60,645 58,654 51,643",
    "defaultFill": "#fcc75f",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_42",
    "points": "75,618 41,628 41,615",
    "defaultFill": "#fff67c",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_43",
    "points": "75,618 41,615 47,606",
    "defaultFill": "#fffc87",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_47",
    "points": "60,645 75,618 79,626",
    "defaultFill": "#febd49",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_44",
    "points": "75,618 47,606 75,604",
    "defaultFill": "#fff099",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_45",
    "points": "41,628 75,618 51,643",
    "defaultFill": "#fffb84",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_46",
    "points": "75,618 60,645 51,643",
    "defaultFill": "#fef16f",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_47",
    "points": "59,900 60,884 72,884",
    "defaultFill": "#fcf58a",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_83",
    "points": "89,871 60,884 36,885",
    "defaultFill": "#6a281c",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_84",
    "points": "72,884 60,884 89,871",
    "defaultFill": "#7e2811",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_48",
    "points": "60,884 51,902 36,885",
    "defaultFill": "#fff88d",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_49",
    "points": "60,884 59,900 51,902",
    "defaultFill": "#fffb90",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_48",
    "points": "75,923 99,890 116,917",
    "defaultFill": "#ffce55",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_50",
    "points": "84,885 99,890 75,923",
    "defaultFill": "#fbe76c",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_60",
    "points": "99,890 132,906 116,917",
    "defaultFill": "#fc8332",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_61",
    "points": "99,890 135,891 132,906",
    "defaultFill": "#fd8a37",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_85",
    "points": "99,890 84,885 89,871",
    "defaultFill": "#7b3712",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_86",
    "points": "99,890 89,871 131,865",
    "defaultFill": "#5b2a09",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_62",
    "points": "135,891 99,890 131,865",
    "defaultFill": "#d66136",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_63",
    "points": "821,679 820,661 831,678",
    "defaultFill": "#e37135",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_64",
    "points": "820,661 821,679 809,679",
    "defaultFill": "#d66d3e",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_45",
    "points": "795,669 820,661 809,679",
    "defaultFill": "#a25946",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_46",
    "points": "845,684 862,668 843,720",
    "defaultFill": "#c35c3b",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_47",
    "points": "835,694 845,684 843,720",
    "defaultFill": "#974e3d",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_65",
    "points": "862,668 845,684 842,673",
    "defaultFill": "#fc6f2a",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_48",
    "points": "845,684 831,678 842,673",
    "defaultFill": "#bc4d1f",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_49",
    "points": "845,684 835,694 831,678",
    "defaultFill": "#b64825",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_86",
    "points": "725,619 716,625 725,611",
    "defaultFill": "#2e4b75",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_79",
    "points": "809,644 795,669 754,664",
    "defaultFill": "#7e4e44",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_50",
    "points": "809,644 820,661 795,669",
    "defaultFill": "#c56334",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_87",
    "points": "619,894 650,903 629,973",
    "defaultFill": "#30486a",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_163",
    "points": "650,903 678,862 671,920",
    "defaultFill": "#101b3b",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_164",
    "points": "650,903 619,894 678,862",
    "defaultFill": "#003558",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_51",
    "points": "778,923 786,939 746,940",
    "defaultFill": "#963c22",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_52",
    "points": "760,917 778,923 746,940",
    "defaultFill": "#974120",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_66",
    "points": "777,892 817,890 779,907",
    "defaultFill": "#ff8931",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_53",
    "points": "777,892 754,884 774,883",
    "defaultFill": "#a75034",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_54",
    "points": "783,867 777,892 774,883",
    "defaultFill": "#c66542",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_67",
    "points": "817,890 777,892 783,867",
    "defaultFill": "#e06d36",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_55",
    "points": "777,892 760,917 754,884",
    "defaultFill": "#cc653c",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_68",
    "points": "760,917 777,892 779,907",
    "defaultFill": "#f76728",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_81",
    "points": "442,126 423,141 423,123",
    "defaultFill": "#6a4f3e",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_82",
    "points": "442,118 442,126 423,123",
    "defaultFill": "#5e4d3b",
    "zone": "head"
  },
  {
    "id": "segment_2_poly_26",
    "points": "442,126 442,118 455,129",
    "defaultFill": "#c1a38b",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_83",
    "points": "423,141 442,126 426,150",
    "defaultFill": "#694841",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_84",
    "points": "442,126 457,150 426,150",
    "defaultFill": "#6b473b",
    "zone": "head"
  },
  {
    "id": "segment_2_poly_27",
    "points": "457,150 442,126 455,129",
    "defaultFill": "#c38c63",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_167",
    "points": "443,541 418,538 427,524",
    "defaultFill": "#093b5e",
    "zone": "arms"
  },
  {
    "id": "segment_4_poly_56",
    "points": "423,547 418,538 443,541",
    "defaultFill": "#277895",
    "zone": "arms"
  },
  {
    "id": "segment_6_poly_15",
    "points": "418,538 423,547 402,581",
    "defaultFill": "#7bdbf4",
    "zone": "arms"
  },
  {
    "id": "segment_4_poly_57",
    "points": "531,587 509,557 546,569",
    "defaultFill": "#2499ad",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_89",
    "points": "509,557 531,587 511,593",
    "defaultFill": "#31597d",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_168",
    "points": "429,553 443,541 447,556",
    "defaultFill": "#06284b",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_169",
    "points": "429,553 423,547 443,541",
    "defaultFill": "#073254",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_170",
    "points": "429,553 447,556 445,585",
    "defaultFill": "#0a1d45",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_171",
    "points": "429,594 429,553 445,585",
    "defaultFill": "#0c254e",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_172",
    "points": "429,553 429,594 402,581",
    "defaultFill": "#15355b",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_90",
    "points": "423,547 429,553 402,581",
    "defaultFill": "#173a62",
    "zone": "arms"
  },
  {
    "id": "segment_6_poly_16",
    "points": "447,556 463,542 471,545",
    "defaultFill": "#7bdbf4",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_91",
    "points": "443,541 463,542 447,556",
    "defaultFill": "#1b3862",
    "zone": "arms"
  },
  {
    "id": "segment_6_poly_17",
    "points": "634,588 639,577 643,611",
    "defaultFill": "#57e6f7",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_173",
    "points": "625,538 586,567 564,536",
    "defaultFill": "#15244d",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_174",
    "points": "586,567 625,538 598,569",
    "defaultFill": "#0a2449",
    "zone": "arms"
  },
  {
    "id": "segment_5_poly_85",
    "points": "360,277 326,281 348,254",
    "defaultFill": "#494856",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_176",
    "points": "331,355 305,370 275,325",
    "defaultFill": "#142543",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_177",
    "points": "305,370 331,355 337,405",
    "defaultFill": "#102042",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_178",
    "points": "320,422 305,370 337,405",
    "defaultFill": "#112d54",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_92",
    "points": "284,370 305,370 320,422",
    "defaultFill": "#344c70",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_93",
    "points": "364,306 366,334 357,299",
    "defaultFill": "#2f5b7e",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_94",
    "points": "366,334 364,306 373,306",
    "defaultFill": "#276282",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_179",
    "points": "331,355 364,345 377,388",
    "defaultFill": "#1b3355",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_180",
    "points": "366,334 364,345 331,355",
    "defaultFill": "#1e3253",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_95",
    "points": "364,345 366,334 394,330",
    "defaultFill": "#254369",
    "zone": "snout"
  },
  {
    "id": "segment_5_poly_86",
    "points": "280,266 266,304 256,298",
    "defaultFill": "#6e4c43",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_87",
    "points": "265,262 280,266 256,298",
    "defaultFill": "#804b3d",
    "zone": "tailArray"
  },
  {
    "id": "segment_5_poly_88",
    "points": "266,304 280,266 289,269",
    "defaultFill": "#7c554e",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_56",
    "points": "280,266 276,241 289,269",
    "defaultFill": "#bf5c35",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_57",
    "points": "267,243 268,252 256,258",
    "defaultFill": "#bd5530",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_58",
    "points": "268,252 265,262 256,258",
    "defaultFill": "#ae5126",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_69",
    "points": "268,252 267,243 276,241",
    "defaultFill": "#ec5c27",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_59",
    "points": "280,266 268,252 276,241",
    "defaultFill": "#cb552f",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_60",
    "points": "268,252 280,266 265,262",
    "defaultFill": "#b45738",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_181",
    "points": "399,225 385,238 392,178",
    "defaultFill": "#0c1b3a",
    "zone": "ears"
  },
  {
    "id": "segment_8_poly_182",
    "points": "415,214 399,225 392,178",
    "defaultFill": "#1c3458",
    "zone": "ears"
  },
  {
    "id": "segment_7_poly_96",
    "points": "399,225 415,214 412,222",
    "defaultFill": "#223a5c",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_183",
    "points": "396,273 399,225 412,222",
    "defaultFill": "#172446",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_184",
    "points": "385,238 399,225 396,273",
    "defaultFill": "#182849",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_185",
    "points": "493,361 487,342 507,347",
    "defaultFill": "#132c55",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_58",
    "points": "493,361 511,360 494,369",
    "defaultFill": "#3a6286",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_59",
    "points": "493,361 507,347 511,360",
    "defaultFill": "#3a6084",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_186",
    "points": "467,362 493,361 494,369",
    "defaultFill": "#15355c",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_187",
    "points": "487,342 493,361 467,362",
    "defaultFill": "#023a5b",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_188",
    "points": "424,341 399,361 394,330",
    "defaultFill": "#1a2c5a",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_60",
    "points": "399,361 364,345 394,330",
    "defaultFill": "#45a9c0",
    "zone": "snout"
  },
  {
    "id": "segment_6_poly_18",
    "points": "364,345 399,361 377,388",
    "defaultFill": "#4cc4d5",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_97",
    "points": "399,361 394,414 377,388",
    "defaultFill": "#213a63",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_19",
    "points": "455,415 470,426 442,428",
    "defaultFill": "#8ec5ec",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_20",
    "points": "434,423 455,415 442,428",
    "defaultFill": "#84a4ca",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_21",
    "points": "477,422 455,415 485,413",
    "defaultFill": "#b3ecff",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_22",
    "points": "455,415 477,422 470,426",
    "defaultFill": "#82bbd6",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_61",
    "points": "446,339 474,303 465,339",
    "defaultFill": "#4b6e8e",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_62",
    "points": "446,339 431,297 474,303",
    "defaultFill": "#4d6c8b",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_189",
    "points": "446,339 424,341 411,318",
    "defaultFill": "#12325b",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_190",
    "points": "431,297 446,339 411,318",
    "defaultFill": "#1c294c",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_152",
    "points": "462,350 446,339 465,339",
    "defaultFill": "#0b1013",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_153",
    "points": "446,339 462,350 454,356",
    "defaultFill": "#0b0f12",
    "zone": "snout"
  },
  {
    "id": "segment_3_poly_49",
    "points": "540,1080 562,1076 545,1087",
    "defaultFill": "#f2ab41",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_70",
    "points": "540,1080 559,1065 562,1076",
    "defaultFill": "#fe9134",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_71",
    "points": "552,1044 540,1080 521,1040",
    "defaultFill": "#f9732a",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_72",
    "points": "559,1065 540,1080 552,1044",
    "defaultFill": "#fd792e",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_61",
    "points": "602,1050 560,1021 590,1006",
    "defaultFill": "#c45e2d",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_73",
    "points": "558,1036 560,1021 602,1050",
    "defaultFill": "#eb6a29",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_98",
    "points": "274,587 271,576 301,570",
    "defaultFill": "#1b3e66",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_191",
    "points": "279,604 274,587 301,570",
    "defaultFill": "#1b2f52",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_99",
    "points": "197,626 266,610 254,648",
    "defaultFill": "#304a6b",
    "zone": "tailArray"
  },
  {
    "id": "segment_6_poly_23",
    "points": "266,610 274,587 279,604",
    "defaultFill": "#65e3f2",
    "zone": "arms"
  },
  {
    "id": "segment_6_poly_24",
    "points": "274,587 266,610 271,576",
    "defaultFill": "#61daeb",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_100",
    "points": "266,610 197,626 185,609",
    "defaultFill": "#32496b",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_101",
    "points": "220,545 266,610 185,609",
    "defaultFill": "#30486a",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_74",
    "points": "850,653 862,668 842,673",
    "defaultFill": "#f15a21",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_75",
    "points": "862,668 850,653 870,660",
    "defaultFill": "#fb6528",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_76",
    "points": "850,653 871,652 870,660",
    "defaultFill": "#ec521c",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_77",
    "points": "871,652 850,653 858,643",
    "defaultFill": "#f25c1d",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_50",
    "points": "831,678 837,662 842,673",
    "defaultFill": "#ff9e45",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_78",
    "points": "820,661 837,662 831,678",
    "defaultFill": "#fc8b3d",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_51",
    "points": "837,662 850,653 842,673",
    "defaultFill": "#fab23c",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_79",
    "points": "809,644 837,662 820,661",
    "defaultFill": "#ef8b35",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_102",
    "points": "603,616 586,567 598,569",
    "defaultFill": "#395678",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_193",
    "points": "520,690 517,698 491,659",
    "defaultFill": "#122043",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_103",
    "points": "520,690 557,691 517,698",
    "defaultFill": "#365476",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_104",
    "points": "513,648 491,659 483,650",
    "defaultFill": "#0d637a",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_194",
    "points": "513,648 520,690 491,659",
    "defaultFill": "#101f40",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_105",
    "points": "492,623 513,648 483,650",
    "defaultFill": "#173d61",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_63",
    "points": "512,627 513,648 492,623",
    "defaultFill": "#268fa5",
    "zone": "arms"
  },
  {
    "id": "segment_10_poly_62",
    "points": "772,916 760,917 779,907",
    "defaultFill": "#b6542d",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_80",
    "points": "778,923 772,916 779,907",
    "defaultFill": "#f7682c",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_81",
    "points": "772,916 778,923 760,917",
    "defaultFill": "#f28b3e",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_52",
    "points": "785,928 779,907 816,917",
    "defaultFill": "#fea44c",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_82",
    "points": "785,928 778,923 779,907",
    "defaultFill": "#eb7b31",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_63",
    "points": "778,923 785,928 786,939",
    "defaultFill": "#c0461d",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_83",
    "points": "785,928 816,917 817,937",
    "defaultFill": "#fb7329",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_84",
    "points": "786,939 785,928 817,937",
    "defaultFill": "#fc912f",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_195",
    "points": "310,488 312,479 351,471",
    "defaultFill": "#0b1d41",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_196",
    "points": "312,479 310,488 258,491",
    "defaultFill": "#1a385a",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_197",
    "points": "310,488 285,537 258,491",
    "defaultFill": "#1c3659",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_106",
    "points": "271,576 285,537 301,570",
    "defaultFill": "#124769",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_200",
    "points": "345,538 285,537 310,488",
    "defaultFill": "#132a4c",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_201",
    "points": "306,616 279,604 301,570",
    "defaultFill": "#0c2045",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_202",
    "points": "254,648 306,616 253,677",
    "defaultFill": "#101b3b",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_203",
    "points": "266,610 306,616 254,648",
    "defaultFill": "#0f1f40",
    "zone": "tailArray"
  },
  {
    "id": "segment_6_poly_25",
    "points": "306,616 266,610 279,604",
    "defaultFill": "#61e6f5",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_204",
    "points": "536,625 512,627 511,593",
    "defaultFill": "#0c2345",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_107",
    "points": "531,587 536,625 511,593",
    "defaultFill": "#335477",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_108",
    "points": "447,534 463,542 443,541",
    "defaultFill": "#14446c",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_109",
    "points": "447,534 443,541 427,524",
    "defaultFill": "#094368",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_110",
    "points": "443,512 447,534 427,524",
    "defaultFill": "#2a3f6e",
    "zone": "arms"
  },
  {
    "id": "segment_6_poly_26",
    "points": "454,523 447,534 443,512",
    "defaultFill": "#7bddfa",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_111",
    "points": "468,533 454,523 472,511",
    "defaultFill": "#3a3d6a",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_112",
    "points": "463,542 468,533 471,545",
    "defaultFill": "#00496c",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_113",
    "points": "468,533 447,534 454,523",
    "defaultFill": "#154873",
    "zone": "arms"
  },
  {
    "id": "segment_6_poly_27",
    "points": "447,534 468,533 463,542",
    "defaultFill": "#6cd9f6",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_205",
    "points": "468,533 509,557 471,545",
    "defaultFill": "#212f54",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_206",
    "points": "468,533 472,511 509,557",
    "defaultFill": "#282c4f",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_64",
    "points": "634,588 613,570 639,577",
    "defaultFill": "#31678b",
    "zone": "arms"
  },
  {
    "id": "segment_4_poly_65",
    "points": "613,570 625,538 639,577",
    "defaultFill": "#25728e",
    "zone": "arms"
  },
  {
    "id": "segment_4_poly_66",
    "points": "625,538 613,570 598,569",
    "defaultFill": "#3b5b82",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_114",
    "points": "613,570 603,616 598,569",
    "defaultFill": "#39557a",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_115",
    "points": "598,489 625,538 564,536",
    "defaultFill": "#365574",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_207",
    "points": "550,505 598,489 564,536",
    "defaultFill": "#0e1b3d",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_116",
    "points": "598,489 549,497 562,473",
    "defaultFill": "#3a567d",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_208",
    "points": "549,497 598,489 550,505",
    "defaultFill": "#0e1c43",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_117",
    "points": "326,281 359,291 357,299",
    "defaultFill": "#394e69",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_118",
    "points": "360,277 359,291 326,281",
    "defaultFill": "#3d4c69",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_119",
    "points": "359,291 364,306 357,299",
    "defaultFill": "#005276",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_120",
    "points": "364,306 359,291 373,306",
    "defaultFill": "#064b75",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_209",
    "points": "359,291 396,273 373,306",
    "defaultFill": "#153355",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_210",
    "points": "359,291 360,277 396,273",
    "defaultFill": "#1b375f",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_211",
    "points": "377,250 385,238 396,273",
    "defaultFill": "#1d3051",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_121",
    "points": "360,277 377,250 396,273",
    "defaultFill": "#1c3a5e",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_67",
    "points": "305,370 279,359 275,325",
    "defaultFill": "#606676",
    "zone": "tailArray"
  },
  {
    "id": "segment_4_poly_68",
    "points": "279,359 305,370 284,370",
    "defaultFill": "#5d657a",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_28",
    "points": "279,359 284,370 245,377",
    "defaultFill": "#9e7a60",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_29",
    "points": "279,359 245,377 230,324",
    "defaultFill": "#c6875b",
    "zone": "tailArray"
  },
  {
    "id": "segment_2_poly_30",
    "points": "275,325 279,359 230,324",
    "defaultFill": "#cdb092",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_213",
    "points": "443,362 399,361 424,341",
    "defaultFill": "#16315e",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_214",
    "points": "443,362 446,339 454,356",
    "defaultFill": "#033455",
    "zone": "snout"
  },
  {
    "id": "segment_7_poly_123",
    "points": "446,339 443,362 424,341",
    "defaultFill": "#1b3b6a",
    "zone": "snout"
  },
  {
    "id": "segment_6_poly_28",
    "points": "443,362 454,356 467,362",
    "defaultFill": "#5ec6e3",
    "zone": "snout"
  },
  {
    "id": "segment_10_poly_64",
    "points": "560,1021 550,1002 590,1006",
    "defaultFill": "#af5f46",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_65",
    "points": "590,1006 550,1002 591,983",
    "defaultFill": "#965340",
    "zone": "tailArray"
  },
  {
    "id": "segment_9_poly_89",
    "points": "550,1002 544,990 591,983",
    "defaultFill": "#4b2b2e",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_85",
    "points": "833,622 837,662 809,644",
    "defaultFill": "#ef762d",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_53",
    "points": "837,662 833,622 850,653",
    "defaultFill": "#fec047",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_54",
    "points": "850,653 833,622 858,643",
    "defaultFill": "#ffdf56",
    "zone": "tailArray"
  },
  {
    "id": "segment_11_poly_51",
    "points": "858,643 833,622 862,618",
    "defaultFill": "#fdf169",
    "zone": "tailArray"
  },
  {
    "id": "segment_3_poly_55",
    "points": "833,622 843,609 862,618",
    "defaultFill": "#fedb5d",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_124",
    "points": "517,698 573,746 571,763",
    "defaultFill": "#29476b",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_125",
    "points": "557,691 573,746 517,698",
    "defaultFill": "#375a80",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_215",
    "points": "573,746 609,743 571,763",
    "defaultFill": "#0f2145",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_126",
    "points": "716,625 643,653 643,611",
    "defaultFill": "#354d6f",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_217",
    "points": "611,666 657,677 641,718",
    "defaultFill": "#0c1b3c",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_218",
    "points": "611,666 643,653 657,677",
    "defaultFill": "#111b3e",
    "zone": "tailArray"
  },
  {
    "id": "segment_6_poly_29",
    "points": "631,605 634,588 643,611",
    "defaultFill": "#59e5f2",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_127",
    "points": "631,605 613,570 634,588",
    "defaultFill": "#385b79",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_219",
    "points": "613,570 631,605 603,616",
    "defaultFill": "#112548",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_128",
    "points": "603,616 565,576 586,567",
    "defaultFill": "#375579",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_220",
    "points": "564,536 565,576 546,569",
    "defaultFill": "#0f2749",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_221",
    "points": "586,567 565,576 564,536",
    "defaultFill": "#11294b",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_129",
    "points": "520,690 556,680 557,691",
    "defaultFill": "#345c7f",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_130",
    "points": "513,648 542,662 520,690",
    "defaultFill": "#2e4a6f",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_30",
    "points": "556,680 542,662 548,656",
    "defaultFill": "#5af4fe",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_131",
    "points": "542,662 556,680 520,690",
    "defaultFill": "#34567b",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_222",
    "points": "313,469 316,460 351,471",
    "defaultFill": "#102952",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_223",
    "points": "312,479 313,469 351,471",
    "defaultFill": "#001b3e",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_224",
    "points": "313,469 312,479 258,491",
    "defaultFill": "#1d3454",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_225",
    "points": "313,469 258,491 312,441",
    "defaultFill": "#1b3251",
    "zone": "tailArray"
  },
  {
    "id": "segment_6_poly_31",
    "points": "316,460 313,469 312,441",
    "defaultFill": "#66eefe",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_226",
    "points": "360,505 310,488 351,471",
    "defaultFill": "#12294b",
    "zone": "arms"
  },
  {
    "id": "segment_1_poly_154",
    "points": "360,505 345,538 310,488",
    "defaultFill": "#0d1333",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_227",
    "points": "360,505 351,471 366,467",
    "defaultFill": "#0a1d3e",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_228",
    "points": "345,538 360,505 418,538",
    "defaultFill": "#013253",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_229",
    "points": "418,538 360,505 427,524",
    "defaultFill": "#0f1a3a",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_230",
    "points": "360,505 433,475 427,524",
    "defaultFill": "#273657",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_231",
    "points": "360,505 366,467 433,475",
    "defaultFill": "#1c3053",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_232",
    "points": "285,537 330,568 301,570",
    "defaultFill": "#142849",
    "zone": "arms"
  },
  {
    "id": "segment_1_poly_155",
    "points": "345,538 330,568 285,537",
    "defaultFill": "#0b1838",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_233",
    "points": "330,568 345,538 366,572",
    "defaultFill": "#132b51",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_234",
    "points": "330,568 306,616 301,570",
    "defaultFill": "#172b4e",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_235",
    "points": "379,574 379,613 366,572",
    "defaultFill": "#162a4b",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_236",
    "points": "379,574 418,538 402,581",
    "defaultFill": "#0d264e",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_237",
    "points": "345,538 379,574 366,572",
    "defaultFill": "#00315c",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_238",
    "points": "379,574 345,538 418,538",
    "defaultFill": "#003c5f",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_239",
    "points": "407,601 429,594 454,642",
    "defaultFill": "#132042",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_240",
    "points": "329,620 379,613 369,641",
    "defaultFill": "#112d52",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_241",
    "points": "330,568 329,620 306,616",
    "defaultFill": "#0f1e3f",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_242",
    "points": "379,613 329,620 366,572",
    "defaultFill": "#102044",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_243",
    "points": "329,620 330,568 366,572",
    "defaultFill": "#192b4f",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_244",
    "points": "452,776 392,705 441,687",
    "defaultFill": "#101f40",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_245",
    "points": "392,705 452,776 340,764",
    "defaultFill": "#1a3256",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_246",
    "points": "336,754 392,705 340,764",
    "defaultFill": "#0d1f43",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_247",
    "points": "354,691 392,705 336,754",
    "defaultFill": "#0f2b50",
    "zone": "legs"
  },
  {
    "id": "segment_6_poly_32",
    "points": "542,662 534,641 548,656",
    "defaultFill": "#64ecfa",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_132",
    "points": "534,641 542,662 513,648",
    "defaultFill": "#2e5075",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_248",
    "points": "534,641 513,648 512,627",
    "defaultFill": "#102952",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_249",
    "points": "536,625 534,641 512,627",
    "defaultFill": "#0e2e55",
    "zone": "arms"
  },
  {
    "id": "segment_6_poly_33",
    "points": "534,641 542,641 548,656",
    "defaultFill": "#53f4fc",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_34",
    "points": "542,641 534,641 536,625",
    "defaultFill": "#59edf9",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_133",
    "points": "598,489 654,494 625,538",
    "defaultFill": "#253f64",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_134",
    "points": "702,421 654,494 590,422",
    "defaultFill": "#3a5573",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_135",
    "points": "654,494 597,468 590,422",
    "defaultFill": "#26446a",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_253",
    "points": "597,468 599,481 562,473",
    "defaultFill": "#08244b",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_254",
    "points": "599,481 598,489 562,473",
    "defaultFill": "#12244a",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_136",
    "points": "654,494 599,481 597,468",
    "defaultFill": "#264063",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_137",
    "points": "599,481 654,494 598,489",
    "defaultFill": "#253f62",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_138",
    "points": "399,361 424,415 394,414",
    "defaultFill": "#173d6c",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_255",
    "points": "443,362 424,415 399,361",
    "defaultFill": "#172a52",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_69",
    "points": "394,414 424,415 428,466",
    "defaultFill": "#565f7e",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_70",
    "points": "424,415 434,423 428,466",
    "defaultFill": "#7d708c",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_93",
    "points": "544,1023 550,1002 560,1021",
    "defaultFill": "#7f3421",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_67",
    "points": "544,1023 560,1021 558,1036",
    "defaultFill": "#863929",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_68",
    "points": "544,1023 521,1040 544,990",
    "defaultFill": "#a4533e",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_69",
    "points": "550,1002 544,1023 544,990",
    "defaultFill": "#c8613e",
    "zone": "tailArray"
  },
  {
    "id": "segment_0_poly_86",
    "points": "544,1023 552,1044 521,1040",
    "defaultFill": "#e25e2e",
    "zone": "tailArray"
  },
  {
    "id": "segment_10_poly_70",
    "points": "544,1023 558,1036 552,1044",
    "defaultFill": "#913d25",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_256",
    "points": "603,638 556,680 548,656",
    "defaultFill": "#132647",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_257",
    "points": "556,680 603,638 611,666",
    "defaultFill": "#142445",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_139",
    "points": "611,666 603,638 643,653",
    "defaultFill": "#24385b",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_258",
    "points": "643,653 603,638 643,611",
    "defaultFill": "#213858",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_259",
    "points": "603,638 631,605 643,611",
    "defaultFill": "#073157",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_260",
    "points": "631,605 603,638 603,616",
    "defaultFill": "#003f5d",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_261",
    "points": "573,746 601,701 609,743",
    "defaultFill": "#19294b",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_262",
    "points": "601,701 573,746 557,691",
    "defaultFill": "#172d52",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_263",
    "points": "609,743 601,701 641,718",
    "defaultFill": "#182849",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_264",
    "points": "601,701 611,666 641,718",
    "defaultFill": "#0e1c3f",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_265",
    "points": "556,680 601,701 557,691",
    "defaultFill": "#0c1f40",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_266",
    "points": "601,701 556,680 611,666",
    "defaultFill": "#09193b",
    "zone": "tailArray"
  },
  {
    "id": "segment_7_poly_140",
    "points": "540,583 536,625 531,587",
    "defaultFill": "#36567c",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_141",
    "points": "540,583 531,587 546,569",
    "defaultFill": "#164f7c",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_267",
    "points": "565,576 540,583 546,569",
    "defaultFill": "#12385f",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_268",
    "points": "403,591 379,574 402,581",
    "defaultFill": "#084061",
    "zone": "arms"
  },
  {
    "id": "segment_4_poly_71",
    "points": "379,574 403,591 379,613",
    "defaultFill": "#48688f",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_269",
    "points": "403,591 407,601 379,613",
    "defaultFill": "#0e2849",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_270",
    "points": "429,594 403,591 402,581",
    "defaultFill": "#183557",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_271",
    "points": "407,601 403,591 429,594",
    "defaultFill": "#18365c",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_272",
    "points": "432,657 407,601 454,642",
    "defaultFill": "#132243",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_273",
    "points": "432,657 454,642 456,656",
    "defaultFill": "#0f2c54",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_274",
    "points": "442,666 432,657 456,656",
    "defaultFill": "#003d5c",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_156",
    "points": "432,657 369,664 369,641",
    "defaultFill": "#0c1939",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_275",
    "points": "379,613 432,657 369,641",
    "defaultFill": "#0d1a3c",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_157",
    "points": "407,601 432,657 379,613",
    "defaultFill": "#0a1739",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_35",
    "points": "369,664 364,656 369,641",
    "defaultFill": "#56e4f0",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_276",
    "points": "364,656 329,620 369,641",
    "defaultFill": "#0e1b3b",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_142",
    "points": "455,397 424,415 443,362",
    "defaultFill": "#233d60",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_277",
    "points": "455,397 443,362 467,362",
    "defaultFill": "#133660",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_36",
    "points": "455,397 455,415 434,423",
    "defaultFill": "#80b2d7",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_72",
    "points": "424,415 455,397 434,423",
    "defaultFill": "#5a6f8a",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_37",
    "points": "455,415 455,397 485,413",
    "defaultFill": "#abdced",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_73",
    "points": "485,413 455,397 494,369",
    "defaultFill": "#416c8e",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_278",
    "points": "455,397 467,362 494,369",
    "defaultFill": "#16365d",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_279",
    "points": "542,641 574,624 548,656",
    "defaultFill": "#0c2a4e",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_280",
    "points": "574,624 603,638 548,656",
    "defaultFill": "#102445",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_281",
    "points": "603,638 574,624 603,616",
    "defaultFill": "#0c2949",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_282",
    "points": "574,624 542,641 536,625",
    "defaultFill": "#10284e",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_283",
    "points": "574,624 565,576 603,616",
    "defaultFill": "#16264a",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_284",
    "points": "540,583 574,624 536,625",
    "defaultFill": "#0e2142",
    "zone": "arms"
  },
  {
    "id": "segment_7_poly_143",
    "points": "574,624 540,583 565,576",
    "defaultFill": "#3b597d",
    "zone": "arms"
  },
  {
    "id": "segment_8_poly_285",
    "points": "427,673 432,657 442,666",
    "defaultFill": "#0a345a",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_286",
    "points": "427,673 446,678 441,687",
    "defaultFill": "#0a385c",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_144",
    "points": "427,673 442,666 446,678",
    "defaultFill": "#004967",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_287",
    "points": "392,705 427,673 441,687",
    "defaultFill": "#0f1c3f",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_158",
    "points": "427,673 392,705 369,664",
    "defaultFill": "#0a1739",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_288",
    "points": "432,657 427,673 369,664",
    "defaultFill": "#142344",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_74",
    "points": "364,656 356,679 329,620",
    "defaultFill": "#6093be",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_159",
    "points": "329,620 356,679 306,616",
    "defaultFill": "#0a1938",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_38",
    "points": "356,679 364,656 369,664",
    "defaultFill": "#5ceff9",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_289",
    "points": "356,679 354,691 253,677",
    "defaultFill": "#071a3b",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_290",
    "points": "306,616 356,679 253,677",
    "defaultFill": "#101b3b",
    "zone": "tailArray"
  },
  {
    "id": "segment_8_poly_291",
    "points": "356,679 392,705 354,691",
    "defaultFill": "#1a385c",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_292",
    "points": "392,705 356,679 369,664",
    "defaultFill": "#102749",
    "zone": "torso"
  }
];
