export type FoxL2Zone = "ears" | "eyes" | "head" | "limbsBack" | "limbsFront" | "snout" | "tail" | "tailTip" | "torso";

export interface FoxL2PolygonDef {
  id: string;
  points: string;
  defaultFill: string;
  /** Anatomical zone from foxL2_grouped.svg (`unassigned` = not classified) */
  zone: FoxL2Zone;
}

export const FOX_L2_POLYGONS: FoxL2PolygonDef[] = [
  {
    "id": "segment_6_poly_1",
    "points": "161,168 163,125 211,192",
    "defaultFill": "#ddba82",
    "zone": "tailTip"
  },
  {
    "id": "segment_2_poly_5",
    "points": "272,447 202,407 210,406",
    "defaultFill": "#101630",
    "zone": "tail"
  },
  {
    "id": "segment_3_poly_1",
    "points": "99,106 161,168 85,183",
    "defaultFill": "#af8a53",
    "zone": "tailTip"
  },
  {
    "id": "segment_6_poly_2",
    "points": "161,168 99,106 163,125",
    "defaultFill": "#e8c67f",
    "zone": "tailTip"
  },
  {
    "id": "segment_6_poly_3",
    "points": "45,110 99,106 58,113",
    "defaultFill": "#fff2b1",
    "zone": "tailTip"
  },
  {
    "id": "segment_9_poly_1",
    "points": "367,429 348,373 416,409",
    "defaultFill": "#304769",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_1",
    "points": "522,208 535,255 493,257",
    "defaultFill": "#213359",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_2",
    "points": "390,338 484,355 416,409",
    "defaultFill": "#2e486b",
    "zone": "torso"
  },
  {
    "id": "segment_3_poly_2",
    "points": "64,133 99,106 85,183",
    "defaultFill": "#ac854e",
    "zone": "tailTip"
  },
  {
    "id": "segment_3_poly_3",
    "points": "99,106 64,133 58,113",
    "defaultFill": "#c7ab62",
    "zone": "tailTip"
  },
  {
    "id": "segment_0_poly_1",
    "points": "45,110 64,133 85,183",
    "defaultFill": "#5d432c",
    "zone": "tailTip"
  },
  {
    "id": "segment_6_poly_4",
    "points": "64,133 45,110 58,113",
    "defaultFill": "#fff1a6",
    "zone": "tailTip"
  },
  {
    "id": "segment_9_poly_3",
    "points": "348,373 373,350 416,409",
    "defaultFill": "#30466b",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_1",
    "points": "383,499 274,552 272,447",
    "defaultFill": "#1b2d51",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_2",
    "points": "274,552 383,499 371,545",
    "defaultFill": "#1e3054",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_3",
    "points": "383,499 367,429 416,409",
    "defaultFill": "#172749",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_4",
    "points": "312,369 373,350 348,373",
    "defaultFill": "#36587b",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_5",
    "points": "580,196 548,227 541,203",
    "defaultFill": "#314b6c",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_6",
    "points": "548,227 522,208 541,203",
    "defaultFill": "#304971",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_8",
    "points": "522,208 548,227 535,255",
    "defaultFill": "#111a39",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_2",
    "points": "578,169 580,196 541,203",
    "defaultFill": "#203054",
    "zone": "ears"
  },
  {
    "id": "segment_8_poly_9",
    "points": "510,179 522,208 493,257",
    "defaultFill": "#142445",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_1",
    "points": "660,208 689,169 715,182",
    "defaultFill": "#4d789a",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_7",
    "points": "660,208 636,242 628,240",
    "defaultFill": "#34547a",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_2",
    "points": "677,480 641,516 656,461",
    "defaultFill": "#4e79a3",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_3",
    "points": "641,516 677,480 683,498",
    "defaultFill": "#214567",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_4",
    "points": "647,560 641,516 683,498",
    "defaultFill": "#1a4162",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_8",
    "points": "641,516 647,560 636,544",
    "defaultFill": "#354e6c",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_5",
    "points": "656,461 634,433 662,419",
    "defaultFill": "#1f3354",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_6",
    "points": "598,384 634,433 592,418",
    "defaultFill": "#223657",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_8",
    "points": "295,711 380,624 399,705",
    "defaultFill": "#0e121e",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_9",
    "points": "380,624 295,711 353,612",
    "defaultFill": "#101420",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_10",
    "points": "380,624 379,571 400,618",
    "defaultFill": "#0d1838",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_11",
    "points": "379,571 380,624 353,612",
    "defaultFill": "#0f1837",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_2",
    "points": "90,215 45,110 85,183",
    "defaultFill": "#4e382b",
    "zone": "tailTip"
  },
  {
    "id": "segment_2_poly_17",
    "points": "90,215 90,263 45,110",
    "defaultFill": "#382b25",
    "zone": "tailTip"
  },
  {
    "id": "segment_9_poly_9",
    "points": "382,346 390,338 416,409",
    "defaultFill": "#3d6692",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_1",
    "points": "373,350 382,346 416,409",
    "defaultFill": "#7eb2e1",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_2",
    "points": "382,346 373,350 390,338",
    "defaultFill": "#64e4fd",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_4",
    "points": "328,571 274,552 371,545",
    "defaultFill": "#1e3152",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_5",
    "points": "479,471 383,499 416,409",
    "defaultFill": "#172749",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_12",
    "points": "454,547 479,471 481,535",
    "defaultFill": "#101b3b",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_13",
    "points": "479,471 454,547 383,499",
    "defaultFill": "#0e1939",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_3",
    "points": "283,418 279,441 272,447",
    "defaultFill": "#79d2f0",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_6",
    "points": "279,441 383,499 272,447",
    "defaultFill": "#1b2d51",
    "zone": "limbsBack"
  },
  {
    "id": "segment_11_poly_7",
    "points": "383,499 279,441 367,429",
    "defaultFill": "#2b3f62",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_10",
    "points": "313,397 283,418 293,392",
    "defaultFill": "#156888",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_8",
    "points": "367,429 313,397 348,373",
    "defaultFill": "#23375a",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_9",
    "points": "279,441 313,397 367,429",
    "defaultFill": "#2c4063",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_11",
    "points": "313,397 279,441 283,418",
    "defaultFill": "#214e75",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_4",
    "points": "617,155 595,156 609,151",
    "defaultFill": "#6fecfe",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_12",
    "points": "595,156 617,155 580,196",
    "defaultFill": "#2d4b71",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_13",
    "points": "578,169 595,156 580,196",
    "defaultFill": "#284c70",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_14",
    "points": "510,179 482,139 504,126",
    "defaultFill": "#32486f",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_3",
    "points": "578,169 533,177 504,126",
    "defaultFill": "#456f95",
    "zone": "ears"
  },
  {
    "id": "segment_9_poly_15",
    "points": "533,177 510,179 504,126",
    "defaultFill": "#30486c",
    "zone": "ears"
  },
  {
    "id": "segment_9_poly_16",
    "points": "533,177 578,169 541,203",
    "defaultFill": "#304a6f",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_4",
    "points": "522,208 533,177 541,203",
    "defaultFill": "#5c87b2",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_5",
    "points": "510,179 533,177 522,208",
    "defaultFill": "#517ea8",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_6",
    "points": "707,230 660,208 715,182",
    "defaultFill": "#4a7796",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_17",
    "points": "707,230 636,242 660,208",
    "defaultFill": "#3c5677",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_7",
    "points": "660,208 684,161 689,169",
    "defaultFill": "#53779b",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_10",
    "points": "634,433 655,378 662,419",
    "defaultFill": "#182b4c",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_11",
    "points": "655,378 634,433 598,384",
    "defaultFill": "#1b2b4d",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_7",
    "points": "665,727 686,729 685,742",
    "defaultFill": "#1b355a",
    "zone": "limbsFront"
  },
  {
    "id": "segment_1_poly_5",
    "points": "677,719 677,711 687,720",
    "defaultFill": "#6ae3f6",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_18",
    "points": "686,729 677,719 687,720",
    "defaultFill": "#006981",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_8",
    "points": "677,719 686,729 665,727",
    "defaultFill": "#1c3963",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_9",
    "points": "666,744 665,727 685,742",
    "defaultFill": "#153359",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_10",
    "points": "666,744 655,722 665,727",
    "defaultFill": "#092c54",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_11",
    "points": "383,499 385,518 371,545",
    "defaultFill": "#002149",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_12",
    "points": "454,547 385,518 383,499",
    "defaultFill": "#062951",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_18",
    "points": "385,518 379,571 371,545",
    "defaultFill": "#071836",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_19",
    "points": "379,571 385,518 454,547",
    "defaultFill": "#0a1531",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_20",
    "points": "552,579 625,649 548,682",
    "defaultFill": "#101324",
    "zone": "limbsFront"
  },
  {
    "id": "segment_11_poly_12",
    "points": "644,686 625,649 641,589",
    "defaultFill": "#254367",
    "zone": "limbsFront"
  },
  {
    "id": "segment_11_poly_13",
    "points": "548,227 584,271 535,255",
    "defaultFill": "#253b60",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_14",
    "points": "584,271 580,196 628,240",
    "defaultFill": "#2e466a",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_15",
    "points": "584,271 548,227 580,196",
    "defaultFill": "#2a4266",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_16",
    "points": "567,310 584,271 589,306",
    "defaultFill": "#30304a",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_6",
    "points": "641,579 647,560 641,589",
    "defaultFill": "#65e3fc",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_17",
    "points": "647,560 641,579 636,544",
    "defaultFill": "#0d4e6c",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_25",
    "points": "698,387 700,340 711,386",
    "defaultFill": "#001a42",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_7",
    "points": "696,406 698,387 711,386",
    "defaultFill": "#5cbcd4",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_18",
    "points": "655,378 696,406 662,419",
    "defaultFill": "#1b2b4c",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_27",
    "points": "698,387 696,406 655,378",
    "defaultFill": "#172645",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_8",
    "points": "684,488 705,448 683,498",
    "defaultFill": "#6be8fa",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_9",
    "points": "677,480 684,488 683,498",
    "defaultFill": "#53f0ff",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_8",
    "points": "697,441 678,468 656,461",
    "defaultFill": "#4e7ba2",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_9",
    "points": "678,468 677,480 656,461",
    "defaultFill": "#527ca2",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_10",
    "points": "678,468 697,441 705,448",
    "defaultFill": "#67e8fb",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_11",
    "points": "684,488 678,468 705,448",
    "defaultFill": "#51b7d0",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_12",
    "points": "678,468 684,488 677,480",
    "defaultFill": "#5ce7fc",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_19",
    "points": "610,463 634,433 656,461",
    "defaultFill": "#426082",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_20",
    "points": "634,433 610,463 592,418",
    "defaultFill": "#415f83",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_21",
    "points": "610,463 579,434 592,418",
    "defaultFill": "#375174",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_24",
    "points": "297,728 295,711 399,705",
    "defaultFill": "#090c1b",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_25",
    "points": "295,711 281,629 353,612",
    "defaultFill": "#101420",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_26",
    "points": "274,552 281,629 237,603",
    "defaultFill": "#0d1838",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_27",
    "points": "328,571 281,629 274,552",
    "defaultFill": "#0e1736",
    "zone": "limbsBack"
  },
  {
    "id": "segment_9_poly_22",
    "points": "197,296 166,227 211,192",
    "defaultFill": "#4f6a85",
    "zone": "tail"
  },
  {
    "id": "segment_2_poly_22",
    "points": "152,333 135,361 127,357",
    "defaultFill": "#0b1838",
    "zone": "tail"
  },
  {
    "id": "segment_2_poly_23",
    "points": "89,273 152,333 127,357",
    "defaultFill": "#182a50",
    "zone": "tail"
  },
  {
    "id": "segment_2_poly_24",
    "points": "135,361 152,333 202,407",
    "defaultFill": "#091638",
    "zone": "tail"
  },
  {
    "id": "segment_2_poly_25",
    "points": "283,418 232,389 293,392",
    "defaultFill": "#0f1a3a",
    "zone": "tail"
  },
  {
    "id": "segment_2_poly_26",
    "points": "202,407 232,389 210,406",
    "defaultFill": "#142448",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_19",
    "points": "232,389 272,447 210,406",
    "defaultFill": "#074e64",
    "zone": "tail"
  },
  {
    "id": "segment_2_poly_27",
    "points": "232,389 283,418 272,447",
    "defaultFill": "#051a39",
    "zone": "tail"
  },
  {
    "id": "segment_7_poly_28",
    "points": "346,588 379,571 353,612",
    "defaultFill": "#0c142b",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_29",
    "points": "281,629 346,588 353,612",
    "defaultFill": "#0d1225",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_13",
    "points": "346,588 281,629 328,571",
    "defaultFill": "#132345",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_30",
    "points": "379,571 346,588 371,545",
    "defaultFill": "#0d1329",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_14",
    "points": "346,588 328,571 371,545",
    "defaultFill": "#1a274a",
    "zone": "limbsBack"
  },
  {
    "id": "segment_9_poly_23",
    "points": "308,378 312,369 348,373",
    "defaultFill": "#3a577f",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_24",
    "points": "313,397 308,378 348,373",
    "defaultFill": "#345276",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_13",
    "points": "504,126 484,127 473,122",
    "defaultFill": "#78e9f7",
    "zone": "ears"
  },
  {
    "id": "segment_11_poly_20",
    "points": "484,127 482,139 473,122",
    "defaultFill": "#14385a",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_10",
    "points": "482,139 484,127 504,126",
    "defaultFill": "#3e7299",
    "zone": "ears"
  },
  {
    "id": "segment_8_poly_28",
    "points": "723,125 724,78 749,126",
    "defaultFill": "#102a4d",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_11",
    "points": "724,78 723,125 699,82",
    "defaultFill": "#3f7a98",
    "zone": "ears"
  },
  {
    "id": "segment_11_poly_21",
    "points": "724,158 723,125 749,126",
    "defaultFill": "#193157",
    "zone": "ears"
  },
  {
    "id": "segment_1_poly_14",
    "points": "719,67 699,82 724,60",
    "defaultFill": "#78e1f7",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_12",
    "points": "724,78 719,67 724,60",
    "defaultFill": "#3682a2",
    "zone": "ears"
  },
  {
    "id": "segment_1_poly_15",
    "points": "719,67 724,78 699,82",
    "defaultFill": "#78bada",
    "zone": "ears"
  },
  {
    "id": "segment_11_poly_22",
    "points": "724,158 732,198 715,182",
    "defaultFill": "#1a2d55",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_13",
    "points": "732,198 707,230 715,182",
    "defaultFill": "#477295",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_14",
    "points": "707,230 732,198 747,215",
    "defaultFill": "#4d7599",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_15",
    "points": "747,215 732,198 749,126",
    "defaultFill": "#436d95",
    "zone": "ears"
  },
  {
    "id": "segment_11_poly_23",
    "points": "732,198 724,158 749,126",
    "defaultFill": "#172e50",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_16",
    "points": "760,258 745,261 747,215",
    "defaultFill": "#567798",
    "zone": "eyes"
  },
  {
    "id": "segment_11_poly_24",
    "points": "782,277 760,258 775,261",
    "defaultFill": "#0a3c45",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_25",
    "points": "745,261 732,259 747,215",
    "defaultFill": "#474658",
    "zone": "eyes"
  },
  {
    "id": "segment_3_poly_4",
    "points": "739,270 732,259 745,261",
    "defaultFill": "#c3845b",
    "zone": "eyes"
  },
  {
    "id": "segment_10_poly_1",
    "points": "760,258 739,270 745,261",
    "defaultFill": "#7b797a",
    "zone": "eyes"
  },
  {
    "id": "segment_4_poly_17",
    "points": "632,165 684,161 660,208",
    "defaultFill": "#52769a",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_25",
    "points": "617,155 632,165 580,196",
    "defaultFill": "#2b496d",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_26",
    "points": "580,196 632,165 628,240",
    "defaultFill": "#36567c",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_27",
    "points": "632,165 660,208 628,240",
    "defaultFill": "#3a587c",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_18",
    "points": "684,161 713,162 689,169",
    "defaultFill": "#4d7aa3",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_19",
    "points": "689,169 713,162 715,182",
    "defaultFill": "#48769a",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_20",
    "points": "713,162 724,158 715,182",
    "defaultFill": "#3d799e",
    "zone": "ears"
  },
  {
    "id": "segment_9_poly_28",
    "points": "700,340 725,354 711,386",
    "defaultFill": "#426288",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_29",
    "points": "725,354 729,378 711,386",
    "defaultFill": "#425e83",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_21",
    "points": "725,354 736,332 747,350",
    "defaultFill": "#5f7994",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_30",
    "points": "579,434 574,409 592,418",
    "defaultFill": "#344e71",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_29",
    "points": "545,370 574,409 555,420",
    "defaultFill": "#0e1b3b",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_30",
    "points": "555,420 566,436 554,440",
    "defaultFill": "#101b3b",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_26",
    "points": "554,440 566,436 582,485",
    "defaultFill": "#223756",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_31",
    "points": "566,436 574,409 579,434",
    "defaultFill": "#365375",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_31",
    "points": "574,409 566,436 555,420",
    "defaultFill": "#0f1e3f",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_15",
    "points": "479,471 483,402 554,440",
    "defaultFill": "#1a2a4c",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_16",
    "points": "483,402 555,420 554,440",
    "defaultFill": "#1a2a4b",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_27",
    "points": "484,355 483,402 416,409",
    "defaultFill": "#223657",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_28",
    "points": "483,402 479,471 416,409",
    "defaultFill": "#223458",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_29",
    "points": "483,402 545,370 555,420",
    "defaultFill": "#1b2a4b",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_31",
    "points": "610,700 558,709 548,682",
    "defaultFill": "#111425",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_35",
    "points": "623,660 610,700 548,682",
    "defaultFill": "#0e1528",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_36",
    "points": "625,649 623,660 548,682",
    "defaultFill": "#031a3c",
    "zone": "limbsFront"
  },
  {
    "id": "segment_11_poly_30",
    "points": "623,660 625,649 644,686",
    "defaultFill": "#2a4467",
    "zone": "limbsFront"
  },
  {
    "id": "segment_4_poly_22",
    "points": "588,571 625,649 552,579",
    "defaultFill": "#569cbe",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_17",
    "points": "625,649 588,571 641,589",
    "defaultFill": "#1c2c4e",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_18",
    "points": "588,571 641,579 641,589",
    "defaultFill": "#1b2e4f",
    "zone": "limbsFront"
  },
  {
    "id": "segment_1_poly_16",
    "points": "484,566 476,554 481,535",
    "defaultFill": "#58bdeb",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_37",
    "points": "379,571 450,576 400,618",
    "defaultFill": "#0e1935",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_38",
    "points": "450,576 379,571 454,547",
    "defaultFill": "#0b1433",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_39",
    "points": "450,576 476,554 484,566",
    "defaultFill": "#101529",
    "zone": "limbsFront"
  },
  {
    "id": "segment_11_poly_31",
    "points": "513,593 552,579 548,682",
    "defaultFill": "#2d4567",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_19",
    "points": "513,593 484,566 552,579",
    "defaultFill": "#152546",
    "zone": "limbsFront"
  },
  {
    "id": "segment_1_poly_17",
    "points": "513,593 450,576 484,566",
    "defaultFill": "#6fc2e4",
    "zone": "limbsFront"
  },
  {
    "id": "segment_10_poly_2",
    "points": "762,293 739,270 760,258",
    "defaultFill": "#7c7c7e",
    "zone": "eyes"
  },
  {
    "id": "segment_9_poly_32",
    "points": "778,292 762,293 782,277",
    "defaultFill": "#1e6372",
    "zone": "snout"
  },
  {
    "id": "segment_10_poly_3",
    "points": "762,293 760,258 782,277",
    "defaultFill": "#6b7c90",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_32",
    "points": "535,255 514,284 493,257",
    "defaultFill": "#24365a",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_33",
    "points": "642,361 655,378 598,384",
    "defaultFill": "#2a4467",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_33",
    "points": "618,320 642,361 598,384",
    "defaultFill": "#2f476b",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_34",
    "points": "635,318 642,361 618,320",
    "defaultFill": "#4e5162",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_32",
    "points": "661,348 698,387 655,378",
    "defaultFill": "#081537",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_35",
    "points": "698,387 661,348 700,340",
    "defaultFill": "#446183",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_33",
    "points": "642,361 661,348 655,378",
    "defaultFill": "#001939",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_34",
    "points": "700,340 661,348 661,314",
    "defaultFill": "#2d3a5a",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_36",
    "points": "661,348 635,318 661,314",
    "defaultFill": "#424d69",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_35",
    "points": "661,348 642,361 635,318",
    "defaultFill": "#244067",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_18",
    "points": "697,441 693,430 705,448",
    "defaultFill": "#58eefc",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_23",
    "points": "693,430 696,406 705,448",
    "defaultFill": "#4388a9",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_37",
    "points": "696,406 693,430 662,419",
    "defaultFill": "#45678a",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_38",
    "points": "693,430 656,461 662,419",
    "defaultFill": "#3f6083",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_24",
    "points": "693,430 697,441 656,461",
    "defaultFill": "#507ca3",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_36",
    "points": "600,487 581,520 582,485",
    "defaultFill": "#1e3054",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_39",
    "points": "610,463 592,475 579,434",
    "defaultFill": "#35577c",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_34",
    "points": "566,436 592,475 582,485",
    "defaultFill": "#141f3f",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_35",
    "points": "592,475 566,436 579,434",
    "defaultFill": "#0f1e3d",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_37",
    "points": "592,475 600,487 582,485",
    "defaultFill": "#1f3253",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_20",
    "points": "297,728 289,729 295,711",
    "defaultFill": "#003159",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_21",
    "points": "232,708 249,711 238,728",
    "defaultFill": "#061f47",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_44",
    "points": "276,697 281,629 295,711",
    "defaultFill": "#11162c",
    "zone": "limbsBack"
  },
  {
    "id": "segment_10_poly_4",
    "points": "167,195 161,168 211,192",
    "defaultFill": "#888179",
    "zone": "tailTip"
  },
  {
    "id": "segment_10_poly_5",
    "points": "166,227 167,195 211,192",
    "defaultFill": "#71767a",
    "zone": "tailTip"
  },
  {
    "id": "segment_0_poly_3",
    "points": "90,215 94,254 90,263",
    "defaultFill": "#5c5344",
    "zone": "tailTip"
  },
  {
    "id": "segment_2_poly_28",
    "points": "133,258 152,333 89,273",
    "defaultFill": "#152040",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_40",
    "points": "133,258 166,227 197,296",
    "defaultFill": "#384f6e",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_38",
    "points": "152,333 133,258 197,296",
    "defaultFill": "#213357",
    "zone": "tail"
  },
  {
    "id": "segment_2_poly_29",
    "points": "133,258 94,254 90,215",
    "defaultFill": "#1c233d",
    "zone": "tailTip"
  },
  {
    "id": "segment_2_poly_30",
    "points": "133,258 89,273 90,263",
    "defaultFill": "#152040",
    "zone": "tailTip"
  },
  {
    "id": "segment_2_poly_31",
    "points": "94,254 133,258 90,263",
    "defaultFill": "#161f3e",
    "zone": "tailTip"
  },
  {
    "id": "segment_2_poly_32",
    "points": "152,333 242,355 202,407",
    "defaultFill": "#112047",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_39",
    "points": "242,355 232,389 202,407",
    "defaultFill": "#26385e",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_40",
    "points": "242,355 152,333 197,296",
    "defaultFill": "#293f64",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_41",
    "points": "238,308 242,355 197,296",
    "defaultFill": "#406788",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_42",
    "points": "242,355 238,308 289,350",
    "defaultFill": "#3b5d83",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_43",
    "points": "293,392 242,355 289,350",
    "defaultFill": "#395f86",
    "zone": "tail"
  },
  {
    "id": "segment_5_poly_22",
    "points": "232,389 242,355 293,392",
    "defaultFill": "#1a2a4c",
    "zone": "tail"
  },
  {
    "id": "segment_4_poly_25",
    "points": "299,381 313,397 293,392",
    "defaultFill": "#49a4c3",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_44",
    "points": "299,381 308,378 313,397",
    "defaultFill": "#215678",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_45",
    "points": "299,381 293,392 289,350",
    "defaultFill": "#32557f",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_46",
    "points": "312,369 299,381 289,350",
    "defaultFill": "#2f5377",
    "zone": "tail"
  },
  {
    "id": "segment_1_poly_19",
    "points": "308,378 299,381 312,369",
    "defaultFill": "#7adef8",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_20",
    "points": "768,257 747,215 775,261",
    "defaultFill": "#84e6f3",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_21",
    "points": "760,258 768,257 775,261",
    "defaultFill": "#6bd8ef",
    "zone": "eyes"
  },
  {
    "id": "segment_4_poly_26",
    "points": "768,257 760,258 747,215",
    "defaultFill": "#357c98",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_41",
    "points": "716,251 707,230 747,215",
    "defaultFill": "#2e344e",
    "zone": "eyes"
  },
  {
    "id": "segment_9_poly_47",
    "points": "732,259 716,251 747,215",
    "defaultFill": "#565563",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_4",
    "points": "716,251 732,259 724,262",
    "defaultFill": "#4c3428",
    "zone": "eyes"
  },
  {
    "id": "segment_9_poly_48",
    "points": "656,147 632,165 617,155",
    "defaultFill": "#2f5176",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_49",
    "points": "632,165 656,147 684,161",
    "defaultFill": "#324f71",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_22",
    "points": "656,147 617,155 609,151",
    "defaultFill": "#70e5f7",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_27",
    "points": "708,134 713,162 684,161",
    "defaultFill": "#4b789f",
    "zone": "ears"
  },
  {
    "id": "segment_8_poly_37",
    "points": "656,147 708,134 684,161",
    "defaultFill": "#151f42",
    "zone": "ears"
  },
  {
    "id": "segment_1_poly_23",
    "points": "708,134 723,125 724,158",
    "defaultFill": "#72daf7",
    "zone": "ears"
  },
  {
    "id": "segment_1_poly_24",
    "points": "713,162 708,134 724,158",
    "defaultFill": "#78def5",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_28",
    "points": "723,125 708,134 699,82",
    "defaultFill": "#3682a6",
    "zone": "ears"
  },
  {
    "id": "segment_11_poly_42",
    "points": "708,134 656,147 699,82",
    "defaultFill": "#15294e",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_29",
    "points": "736,332 745,332 747,350",
    "defaultFill": "#4c96b1",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_30",
    "points": "762,293 745,332 749,300",
    "defaultFill": "#7690a7",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_25",
    "points": "745,332 778,292 747,350",
    "defaultFill": "#68b5c7",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_31",
    "points": "745,332 762,293 778,292",
    "defaultFill": "#7099ad",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_32",
    "points": "745,332 738,317 749,300",
    "defaultFill": "#688aa5",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_26",
    "points": "738,317 745,332 736,332",
    "defaultFill": "#94d3dc",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_27",
    "points": "729,378 734,363 747,350",
    "defaultFill": "#77e5fc",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_33",
    "points": "734,363 725,354 747,350",
    "defaultFill": "#587ea2",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_38",
    "points": "725,354 734,363 729,378",
    "defaultFill": "#081c37",
    "zone": "snout"
  },
  {
    "id": "segment_7_poly_45",
    "points": "626,691 643,719 610,700",
    "defaultFill": "#0e1b3b",
    "zone": "limbsFront"
  },
  {
    "id": "segment_11_poly_43",
    "points": "626,691 623,660 644,686",
    "defaultFill": "#29456a",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_23",
    "points": "623,660 626,691 610,700",
    "defaultFill": "#122243",
    "zone": "limbsFront"
  },
  {
    "id": "segment_11_poly_44",
    "points": "654,700 626,691 644,686",
    "defaultFill": "#264063",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_24",
    "points": "626,691 654,700 643,719",
    "defaultFill": "#223c5f",
    "zone": "limbsFront"
  },
  {
    "id": "segment_11_poly_45",
    "points": "590,382 598,384 592,418",
    "defaultFill": "#213556",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_46",
    "points": "574,409 590,382 592,418",
    "defaultFill": "#203455",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_47",
    "points": "618,320 590,382 569,363",
    "defaultFill": "#2a4469",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_48",
    "points": "590,382 618,320 598,384",
    "defaultFill": "#2b4367",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_49",
    "points": "559,365 567,310 569,363",
    "defaultFill": "#1d395e",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_39",
    "points": "545,370 559,365 574,409",
    "defaultFill": "#0e1d3c",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_50",
    "points": "590,382 559,365 569,363",
    "defaultFill": "#274368",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_40",
    "points": "559,365 590,382 574,409",
    "defaultFill": "#101b3b",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_50",
    "points": "518,357 483,402 484,355",
    "defaultFill": "#37577d",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_41",
    "points": "483,402 518,357 545,370",
    "defaultFill": "#132042",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_25",
    "points": "576,747 591,746 587,767",
    "defaultFill": "#0e3f67",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_26",
    "points": "557,771 576,747 587,767",
    "defaultFill": "#1b335f",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_47",
    "points": "643,719 629,739 610,700",
    "defaultFill": "#0f1c3c",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_48",
    "points": "629,739 591,746 610,700",
    "defaultFill": "#08101d",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_27",
    "points": "629,739 655,722 666,744",
    "defaultFill": "#122546",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_28",
    "points": "629,739 643,719 655,722",
    "defaultFill": "#142446",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_50",
    "points": "591,746 629,739 587,767",
    "defaultFill": "#0f1025",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_29",
    "points": "547,738 558,709 563,736",
    "defaultFill": "#163055",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_51",
    "points": "591,746 573,738 610,700",
    "defaultFill": "#0b0c1e",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_52",
    "points": "573,738 558,709 610,700",
    "defaultFill": "#080b1a",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_30",
    "points": "558,709 573,738 563,736",
    "defaultFill": "#003951",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_31",
    "points": "573,738 576,747 563,736",
    "defaultFill": "#16385e",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_32",
    "points": "576,747 573,738 591,746",
    "defaultFill": "#004265",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_53",
    "points": "426,689 440,708 399,705",
    "defaultFill": "#0d1c3d",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_56",
    "points": "380,624 412,689 399,705",
    "defaultFill": "#0b1a37",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_57",
    "points": "412,689 426,689 399,705",
    "defaultFill": "#0c1532",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_33",
    "points": "613,541 588,571 579,562",
    "defaultFill": "#173559",
    "zone": "limbsFront"
  },
  {
    "id": "segment_11_poly_51",
    "points": "613,541 641,516 636,544",
    "defaultFill": "#03506e",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_58",
    "points": "641,579 613,541 636,544",
    "defaultFill": "#071532",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_59",
    "points": "588,571 613,541 641,579",
    "defaultFill": "#0c193b",
    "zone": "limbsFront"
  },
  {
    "id": "segment_11_poly_52",
    "points": "613,541 600,487 641,516",
    "defaultFill": "#273f61",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_53",
    "points": "600,487 613,541 581,520",
    "defaultFill": "#284160",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_28",
    "points": "489,528 484,566 481,535",
    "defaultFill": "#69b8e1",
    "zone": "limbsFront"
  },
  {
    "id": "segment_4_poly_34",
    "points": "479,471 489,528 481,535",
    "defaultFill": "#568fc4",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_51",
    "points": "581,520 541,516 582,485",
    "defaultFill": "#324a6c",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_34",
    "points": "541,516 489,528 479,471",
    "defaultFill": "#132243",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_54",
    "points": "541,516 554,440 582,485",
    "defaultFill": "#26385c",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_55",
    "points": "541,516 479,471 554,440",
    "defaultFill": "#1e3152",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_35",
    "points": "462,549 450,576 454,547",
    "defaultFill": "#6098cb",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_60",
    "points": "450,576 462,549 476,554",
    "defaultFill": "#0f1629",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_35",
    "points": "462,549 454,547 481,535",
    "defaultFill": "#06264d",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_36",
    "points": "476,554 462,549 481,535",
    "defaultFill": "#0d2853",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_37",
    "points": "452,690 513,593 548,682",
    "defaultFill": "#00355a",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_38",
    "points": "440,708 452,690 456,705",
    "defaultFill": "#152547",
    "zone": "limbsFront"
  },
  {
    "id": "segment_11_poly_56",
    "points": "526,284 514,284 535,255",
    "defaultFill": "#253860",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_57",
    "points": "584,271 526,284 535,255",
    "defaultFill": "#23355b",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_58",
    "points": "567,310 526,284 584,271",
    "defaultFill": "#223659",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_52",
    "points": "604,476 592,475 610,463",
    "defaultFill": "#436487",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_53",
    "points": "592,475 604,476 600,487",
    "defaultFill": "#35668e",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_59",
    "points": "600,487 604,476 641,516",
    "defaultFill": "#273b5c",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_54",
    "points": "641,516 604,476 656,461",
    "defaultFill": "#3e5f7e",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_55",
    "points": "604,476 610,463 656,461",
    "defaultFill": "#426082",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_39",
    "points": "276,697 255,638 281,629",
    "defaultFill": "#1e365a",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_61",
    "points": "281,629 255,638 237,603",
    "defaultFill": "#0b1634",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_62",
    "points": "255,638 232,708 237,603",
    "defaultFill": "#0d1a3a",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_63",
    "points": "232,708 255,638 249,711",
    "defaultFill": "#0d1836",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_40",
    "points": "255,638 276,697 249,711",
    "defaultFill": "#172951",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_41",
    "points": "289,729 280,709 295,711",
    "defaultFill": "#0f2d51",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_42",
    "points": "280,709 276,697 295,711",
    "defaultFill": "#003e62",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_43",
    "points": "280,709 289,729 268,732",
    "defaultFill": "#132549",
    "zone": "limbsBack"
  },
  {
    "id": "segment_3_poly_5",
    "points": "116,197 167,195 166,227",
    "defaultFill": "#9a7c56",
    "zone": "tailTip"
  },
  {
    "id": "segment_2_poly_33",
    "points": "116,197 133,258 90,215",
    "defaultFill": "#1f253f",
    "zone": "tailTip"
  },
  {
    "id": "segment_9_poly_56",
    "points": "133,258 116,197 166,227",
    "defaultFill": "#45556c",
    "zone": "tailTip"
  },
  {
    "id": "segment_3_poly_6",
    "points": "116,197 90,215 85,183",
    "defaultFill": "#93734c",
    "zone": "tailTip"
  },
  {
    "id": "segment_3_poly_7",
    "points": "161,168 116,197 85,183",
    "defaultFill": "#a78558",
    "zone": "tailTip"
  },
  {
    "id": "segment_3_poly_8",
    "points": "167,195 116,197 161,168",
    "defaultFill": "#a18256",
    "zone": "tailTip"
  },
  {
    "id": "segment_9_poly_57",
    "points": "240,300 197,296 211,192",
    "defaultFill": "#42688d",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_58",
    "points": "240,300 238,308 197,296",
    "defaultFill": "#3f678b",
    "zone": "tail"
  },
  {
    "id": "segment_1_poly_29",
    "points": "238,308 240,300 289,350",
    "defaultFill": "#59bfd5",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_59",
    "points": "707,230 688,289 636,242",
    "defaultFill": "#435a79",
    "zone": "head"
  },
  {
    "id": "segment_10_poly_6",
    "points": "716,251 688,289 707,230",
    "defaultFill": "#72757e",
    "zone": "head"
  },
  {
    "id": "segment_10_poly_7",
    "points": "705,328 688,289 718,295",
    "defaultFill": "#968679",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_60",
    "points": "705,328 700,340 661,314",
    "defaultFill": "#2d3c5d",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_42",
    "points": "705,328 725,354 700,340",
    "defaultFill": "#20131c",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_43",
    "points": "725,354 705,328 736,332",
    "defaultFill": "#23181c",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_60",
    "points": "643,719 658,707 655,722",
    "defaultFill": "#234d77",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_44",
    "points": "654,700 658,707 643,719",
    "defaultFill": "#0d4264",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_45",
    "points": "658,707 654,700 677,711",
    "defaultFill": "#092646",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_61",
    "points": "655,722 658,707 665,727",
    "defaultFill": "#2e507d",
    "zone": "limbsFront"
  },
  {
    "id": "segment_1_poly_30",
    "points": "677,719 658,707 677,711",
    "defaultFill": "#75e5fd",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_62",
    "points": "658,707 677,719 665,727",
    "defaultFill": "#30537d",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_63",
    "points": "495,350 518,357 484,355",
    "defaultFill": "#146f8c",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_46",
    "points": "556,751 547,738 563,736",
    "defaultFill": "#1b395d",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_47",
    "points": "576,747 556,751 563,736",
    "defaultFill": "#1a385a",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_48",
    "points": "556,751 576,747 557,771",
    "defaultFill": "#10375e",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_49",
    "points": "556,751 557,771 532,764",
    "defaultFill": "#16264a",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_65",
    "points": "511,721 547,738 532,764",
    "defaultFill": "#0d1a3a",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_66",
    "points": "452,690 511,721 456,705",
    "defaultFill": "#0c0b1b",
    "zone": "limbsFront"
  },
  {
    "id": "segment_11_poly_61",
    "points": "576,531 613,541 579,562",
    "defaultFill": "#243859",
    "zone": "limbsFront"
  },
  {
    "id": "segment_11_poly_62",
    "points": "613,541 576,531 581,520",
    "defaultFill": "#263d5d",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_64",
    "points": "576,531 541,516 581,520",
    "defaultFill": "#324a6c",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_67",
    "points": "435,692 440,708 426,689",
    "defaultFill": "#0d1c3d",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_50",
    "points": "435,692 452,690 440,708",
    "defaultFill": "#0f2c54",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_68",
    "points": "513,593 443,682 450,576",
    "defaultFill": "#0e1420",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_69",
    "points": "452,690 443,682 513,593",
    "defaultFill": "#0f131f",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_70",
    "points": "450,576 443,682 400,618",
    "defaultFill": "#0f1521",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_51",
    "points": "435,692 443,682 452,690",
    "defaultFill": "#1a2c54",
    "zone": "limbsFront"
  },
  {
    "id": "segment_11_poly_63",
    "points": "559,365 530,356 567,310",
    "defaultFill": "#253d5f",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_31",
    "points": "530,356 559,365 545,370",
    "defaultFill": "#68bdda",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_65",
    "points": "518,357 530,356 545,370",
    "defaultFill": "#1b6485",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_64",
    "points": "584,271 614,284 589,306",
    "defaultFill": "#45414f",
    "zone": "eyes"
  },
  {
    "id": "segment_3_poly_9",
    "points": "614,284 611,300 589,306",
    "defaultFill": "#b47e4f",
    "zone": "eyes"
  },
  {
    "id": "segment_11_poly_65",
    "points": "614,284 584,271 628,240",
    "defaultFill": "#2c3147",
    "zone": "eyes"
  },
  {
    "id": "segment_8_poly_44",
    "points": "636,242 614,284 628,240",
    "defaultFill": "#1d2240",
    "zone": "eyes"
  },
  {
    "id": "segment_11_poly_66",
    "points": "638,290 614,284 636,242",
    "defaultFill": "#3e3c49",
    "zone": "eyes"
  },
  {
    "id": "segment_6_poly_5",
    "points": "623,311 635,318 618,320",
    "defaultFill": "#fad35c",
    "zone": "eyes"
  },
  {
    "id": "segment_6_poly_6",
    "points": "606,312 623,311 618,320",
    "defaultFill": "#ffe35e",
    "zone": "eyes"
  },
  {
    "id": "segment_6_poly_7",
    "points": "623,311 606,312 611,300",
    "defaultFill": "#fff180",
    "zone": "eyes"
  },
  {
    "id": "segment_5_poly_52",
    "points": "260,712 280,709 268,732",
    "defaultFill": "#132344",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_71",
    "points": "260,712 268,732 238,728",
    "defaultFill": "#0f1535",
    "zone": "limbsBack"
  },
  {
    "id": "segment_7_poly_72",
    "points": "249,711 260,712 238,728",
    "defaultFill": "#0e1939",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_53",
    "points": "276,697 260,712 249,711",
    "defaultFill": "#162b56",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_54",
    "points": "280,709 260,712 276,697",
    "defaultFill": "#16284e",
    "zone": "limbsBack"
  },
  {
    "id": "segment_11_poly_67",
    "points": "671,298 705,328 661,314",
    "defaultFill": "#32425b",
    "zone": "snout"
  },
  {
    "id": "segment_10_poly_8",
    "points": "705,328 671,298 688,289",
    "defaultFill": "#6e7882",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_68",
    "points": "671,298 638,290 636,242",
    "defaultFill": "#343549",
    "zone": "eyes"
  },
  {
    "id": "segment_9_poly_66",
    "points": "688,289 671,298 636,242",
    "defaultFill": "#415a79",
    "zone": "head"
  },
  {
    "id": "segment_10_poly_9",
    "points": "688,289 709,285 718,295",
    "defaultFill": "#888485",
    "zone": "head"
  },
  {
    "id": "segment_10_poly_10",
    "points": "709,285 688,289 716,251",
    "defaultFill": "#757575",
    "zone": "head"
  },
  {
    "id": "segment_6_poly_8",
    "points": "732,259 731,267 724,262",
    "defaultFill": "#fefef6",
    "zone": "eyes"
  },
  {
    "id": "segment_3_poly_10",
    "points": "739,270 731,267 732,259",
    "defaultFill": "#ce8246",
    "zone": "eyes"
  },
  {
    "id": "segment_6_poly_9",
    "points": "732,276 731,267 739,270",
    "defaultFill": "#ffd778",
    "zone": "eyes"
  },
  {
    "id": "segment_6_poly_10",
    "points": "732,276 739,287 727,283",
    "defaultFill": "#fad064",
    "zone": "eyes"
  },
  {
    "id": "segment_6_poly_11",
    "points": "739,287 732,276 739,270",
    "defaultFill": "#ffd85f",
    "zone": "eyes"
  },
  {
    "id": "segment_10_poly_11",
    "points": "739,287 762,293 749,300",
    "defaultFill": "#7a7879",
    "zone": "eyes"
  },
  {
    "id": "segment_10_poly_12",
    "points": "762,293 739,287 739,270",
    "defaultFill": "#928275",
    "zone": "eyes"
  },
  {
    "id": "segment_3_poly_11",
    "points": "731,322 705,328 718,295",
    "defaultFill": "#ad9277",
    "zone": "snout"
  },
  {
    "id": "segment_10_poly_13",
    "points": "731,322 738,317 736,332",
    "defaultFill": "#94aead",
    "zone": "snout"
  },
  {
    "id": "segment_0_poly_5",
    "points": "705,328 731,322 736,332",
    "defaultFill": "#665140",
    "zone": "snout"
  },
  {
    "id": "segment_5_poly_55",
    "points": "547,738 547,746 532,764",
    "defaultFill": "#162647",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_56",
    "points": "547,746 556,751 532,764",
    "defaultFill": "#122746",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_57",
    "points": "556,751 547,746 547,738",
    "defaultFill": "#193356",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_58",
    "points": "547,738 530,703 558,709",
    "defaultFill": "#1f355c",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_59",
    "points": "511,721 530,703 547,738",
    "defaultFill": "#0f1f41",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_60",
    "points": "530,703 452,690 548,682",
    "defaultFill": "#0e4667",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_73",
    "points": "530,703 511,721 452,690",
    "defaultFill": "#0b0c20",
    "zone": "limbsFront"
  },
  {
    "id": "segment_11_poly_69",
    "points": "561,563 576,531 579,562",
    "defaultFill": "#233a5a",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_67",
    "points": "576,531 561,563 541,516",
    "defaultFill": "#335072",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_74",
    "points": "443,682 424,680 400,618",
    "defaultFill": "#081b3b",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_61",
    "points": "412,689 424,680 426,689",
    "defaultFill": "#1e2e52",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_62",
    "points": "424,680 435,692 426,689",
    "defaultFill": "#152e56",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_63",
    "points": "424,680 443,682 435,692",
    "defaultFill": "#172c59",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_64",
    "points": "424,680 380,624 400,618",
    "defaultFill": "#21395f",
    "zone": "limbsBack"
  },
  {
    "id": "segment_5_poly_65",
    "points": "424,680 412,689 380,624",
    "defaultFill": "#1f365f",
    "zone": "limbsBack"
  },
  {
    "id": "segment_11_poly_70",
    "points": "526,284 527,312 514,284",
    "defaultFill": "#223861",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_45",
    "points": "527,312 526,284 567,310",
    "defaultFill": "#172846",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_46",
    "points": "530,356 527,312 567,310",
    "defaultFill": "#172643",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_66",
    "points": "519,325 527,312 530,356",
    "defaultFill": "#07294c",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_71",
    "points": "597,311 618,320 569,363",
    "defaultFill": "#3a4257",
    "zone": "snout"
  },
  {
    "id": "segment_3_poly_12",
    "points": "597,311 606,312 618,320",
    "defaultFill": "#ba894e",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_72",
    "points": "567,310 597,311 569,363",
    "defaultFill": "#2a4161",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_68",
    "points": "597,311 567,310 589,306",
    "defaultFill": "#5b5e6d",
    "zone": "snout"
  },
  {
    "id": "segment_0_poly_6",
    "points": "611,300 597,311 589,306",
    "defaultFill": "#623317",
    "zone": "eyes"
  },
  {
    "id": "segment_3_poly_13",
    "points": "606,312 597,311 611,300",
    "defaultFill": "#ca863f",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_7",
    "points": "629,291 614,284 638,290",
    "defaultFill": "#3f2622",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_8",
    "points": "614,284 629,291 611,300",
    "defaultFill": "#4e2c23",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_9",
    "points": "629,291 623,311 611,300",
    "defaultFill": "#623122",
    "zone": "eyes"
  },
  {
    "id": "segment_6_poly_12",
    "points": "716,280 727,283 718,295",
    "defaultFill": "#fcba5c",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_10",
    "points": "709,285 716,280 718,295",
    "defaultFill": "#412517",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_11",
    "points": "716,280 732,276 727,283",
    "defaultFill": "#6f3a28",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_12",
    "points": "716,280 716,251 724,262",
    "defaultFill": "#492a25",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_13",
    "points": "716,280 709,285 716,251",
    "defaultFill": "#371b17",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_14",
    "points": "731,267 716,280 724,262",
    "defaultFill": "#502c20",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_15",
    "points": "716,280 731,267 732,276",
    "defaultFill": "#5f3326",
    "zone": "eyes"
  },
  {
    "id": "segment_3_poly_14",
    "points": "727,283 730,294 718,295",
    "defaultFill": "#dfa865",
    "zone": "eyes"
  },
  {
    "id": "segment_6_poly_13",
    "points": "739,287 730,294 727,283",
    "defaultFill": "#ecb16d",
    "zone": "eyes"
  },
  {
    "id": "segment_9_poly_69",
    "points": "730,294 731,322 718,295",
    "defaultFill": "#536567",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_70",
    "points": "731,322 730,294 738,317",
    "defaultFill": "#4c6470",
    "zone": "snout"
  },
  {
    "id": "segment_10_poly_14",
    "points": "738,317 730,294 749,300",
    "defaultFill": "#716d6e",
    "zone": "snout"
  },
  {
    "id": "segment_10_poly_15",
    "points": "730,294 739,287 749,300",
    "defaultFill": "#908275",
    "zone": "eyes"
  },
  {
    "id": "segment_1_poly_32",
    "points": "558,709 551,702 548,682",
    "defaultFill": "#6ce3f9",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_67",
    "points": "551,702 530,703 548,682",
    "defaultFill": "#22395b",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_68",
    "points": "530,703 551,702 558,709",
    "defaultFill": "#1a365d",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_71",
    "points": "561,563 557,571 541,516",
    "defaultFill": "#334e6c",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_69",
    "points": "484,566 557,571 552,579",
    "defaultFill": "#1d3051",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_75",
    "points": "557,571 588,571 552,579",
    "defaultFill": "#11132c",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_70",
    "points": "489,528 557,571 484,566",
    "defaultFill": "#132241",
    "zone": "limbsFront"
  },
  {
    "id": "segment_5_poly_71",
    "points": "541,516 557,571 489,528",
    "defaultFill": "#122244",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_76",
    "points": "588,571 557,571 579,562",
    "defaultFill": "#0d152c",
    "zone": "limbsFront"
  },
  {
    "id": "segment_1_poly_33",
    "points": "557,571 561,563 579,562",
    "defaultFill": "#5ecced",
    "zone": "limbsFront"
  },
  {
    "id": "segment_1_poly_34",
    "points": "510,324 505,331 514,284",
    "defaultFill": "#6be3fb",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_35",
    "points": "505,331 510,324 519,325",
    "defaultFill": "#5fe2f6",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_73",
    "points": "527,312 510,324 514,284",
    "defaultFill": "#1e3662",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_36",
    "points": "510,324 527,312 519,325",
    "defaultFill": "#5de2f3",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_37",
    "points": "517,347 530,356 518,357",
    "defaultFill": "#58d0e9",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_36",
    "points": "517,347 519,325 530,356",
    "defaultFill": "#54a9c6",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_72",
    "points": "495,350 517,347 518,357",
    "defaultFill": "#1d5d81",
    "zone": "torso"
  },
  {
    "id": "segment_0_poly_16",
    "points": "637,304 629,291 638,290",
    "defaultFill": "#42241a",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_17",
    "points": "629,291 637,304 623,311",
    "defaultFill": "#5f3020",
    "zone": "eyes"
  },
  {
    "id": "segment_6_poly_14",
    "points": "623,311 637,304 635,318",
    "defaultFill": "#fdd37d",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_18",
    "points": "635,318 637,304 661,314",
    "defaultFill": "#592a16",
    "zone": "eyes"
  },
  {
    "id": "segment_8_poly_52",
    "points": "637,304 671,298 661,314",
    "defaultFill": "#1e131b",
    "zone": "eyes"
  },
  {
    "id": "segment_8_poly_53",
    "points": "671,298 637,304 638,290",
    "defaultFill": "#240c0c",
    "zone": "eyes"
  }
];
