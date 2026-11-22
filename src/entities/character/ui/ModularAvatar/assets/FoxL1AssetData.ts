export type FoxL1Zone = "ear_far" | "ear_near" | "eyes" | "head" | "snout" | "tail" | "torso" | "unassigned";

export interface FoxL1PolygonDef {
  id: string;
  points: string;
  defaultFill: string;
  /** Anatomical zone from foxL1_grouped.svg (`unassigned` = not classified) */
  zone: FoxL1Zone;
}

export const FOX_L1_POLYGONS: FoxL1PolygonDef[] = [
  {
    "id": "segment_6_poly_13",
    "points": "277,526 355,484 361,505",
    "defaultFill": "#0d142e",
    "zone": "tail"
  },
  {
    "id": "segment_5_poly_1",
    "points": "289,454 355,484 277,526",
    "defaultFill": "#24354f",
    "zone": "tail"
  },
  {
    "id": "segment_6_poly_16",
    "points": "355,484 367,498 361,505",
    "defaultFill": "#0d1b35",
    "zone": "tail"
  },
  {
    "id": "segment_6_poly_17",
    "points": "367,498 355,484 401,468",
    "defaultFill": "#0c1733",
    "zone": "tail"
  },
  {
    "id": "segment_1_poly_1",
    "points": "154,489 163,492 194,515",
    "defaultFill": "#43668c",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_1",
    "points": "241,500 289,454 277,526",
    "defaultFill": "#15253f",
    "zone": "tail"
  },
  {
    "id": "segment_1_poly_2",
    "points": "396,354 348,335 342,315",
    "defaultFill": "#487497",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_3",
    "points": "279,308 266,332 267,312",
    "defaultFill": "#405e84",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_2",
    "points": "306,357 266,332 279,308",
    "defaultFill": "#233c5b",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_2",
    "points": "55,368 79,357 89,395",
    "defaultFill": "#0e213f",
    "zone": "ear_far"
  },
  {
    "id": "segment_10_poly_1",
    "points": "96,352 79,357 74,332",
    "defaultFill": "#213a59",
    "zone": "ear_far"
  },
  {
    "id": "segment_8_poly_3",
    "points": "114,474 126,469 127,478",
    "defaultFill": "#0a1630",
    "zone": "unassigned"
  },
  {
    "id": "segment_8_poly_4",
    "points": "111,459 126,469 114,474",
    "defaultFill": "#071532",
    "zone": "unassigned"
  },
  {
    "id": "segment_10_poly_2",
    "points": "149,481 163,492 154,489",
    "defaultFill": "#163b58",
    "zone": "tail"
  },
  {
    "id": "segment_10_poly_3",
    "points": "106,437 110,447 111,459",
    "defaultFill": "#284361",
    "zone": "snout"
  },
  {
    "id": "segment_5_poly_3",
    "points": "323,321 306,357 279,308",
    "defaultFill": "#253c5e",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_4",
    "points": "334,315 323,321 279,308",
    "defaultFill": "#38688c",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_5",
    "points": "225,259 226,288 214,261",
    "defaultFill": "#44637f",
    "zone": "ear_near"
  },
  {
    "id": "segment_9_poly_1",
    "points": "225,259 214,261 235,252",
    "defaultFill": "#93bee9",
    "zone": "ear_near"
  },
  {
    "id": "segment_10_poly_4",
    "points": "202,290 181,294 214,261",
    "defaultFill": "#1d3655",
    "zone": "ear_near"
  },
  {
    "id": "segment_10_poly_5",
    "points": "176,352 177,396 162,379",
    "defaultFill": "#2d3b55",
    "zone": "snout"
  },
  {
    "id": "segment_5_poly_4",
    "points": "194,515 204,509 277,526",
    "defaultFill": "#162d4f",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_6",
    "points": "204,509 241,500 277,526",
    "defaultFill": "#0f1431",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_7",
    "points": "278,387 285,360 306,357",
    "defaultFill": "#0e1e37",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_5",
    "points": "285,360 266,332 306,357",
    "defaultFill": "#293d58",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_6",
    "points": "409,396 388,397 396,354",
    "defaultFill": "#44658e",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_7",
    "points": "388,397 409,396 414,414",
    "defaultFill": "#3c5e83",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_8",
    "points": "414,424 388,397 414,414",
    "defaultFill": "#435f87",
    "zone": "torso"
  },
  {
    "id": "segment_10_poly_6",
    "points": "53,349 55,368 44,345",
    "defaultFill": "#0e284b",
    "zone": "ear_far"
  },
  {
    "id": "segment_8_poly_8",
    "points": "55,368 53,349 79,357",
    "defaultFill": "#121e38",
    "zone": "ear_far"
  },
  {
    "id": "segment_11_poly_1",
    "points": "74,332 53,349 44,345",
    "defaultFill": "#374b6e",
    "zone": "ear_far"
  },
  {
    "id": "segment_10_poly_7",
    "points": "79,357 53,349 74,332",
    "defaultFill": "#293c5c",
    "zone": "ear_far"
  },
  {
    "id": "segment_8_poly_9",
    "points": "91,328 96,352 74,332",
    "defaultFill": "#112240",
    "zone": "ear_far"
  },
  {
    "id": "segment_7_poly_1",
    "points": "157,427 155,418 166,423",
    "defaultFill": "#ecc278",
    "zone": "eyes"
  },
  {
    "id": "segment_8_poly_10",
    "points": "94,403 107,426 106,437",
    "defaultFill": "#081b39",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_11",
    "points": "131,422 107,426 94,403",
    "defaultFill": "#0e1a32",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_12",
    "points": "107,426 131,422 106,437",
    "defaultFill": "#111f39",
    "zone": "snout"
  },
  {
    "id": "segment_0_poly_1",
    "points": "155,418 166,410 166,423",
    "defaultFill": "#432314",
    "zone": "eyes"
  },
  {
    "id": "segment_5_poly_6",
    "points": "323,321 331,325 306,357",
    "defaultFill": "#263b56",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_9",
    "points": "331,325 323,321 334,315",
    "defaultFill": "#355878",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_2",
    "points": "331,325 334,315 342,315",
    "defaultFill": "#315376",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_10",
    "points": "348,335 331,325 342,315",
    "defaultFill": "#426688",
    "zone": "torso"
  },
  {
    "id": "segment_10_poly_8",
    "points": "235,260 244,274 226,288",
    "defaultFill": "#263a55",
    "zone": "ear_near"
  },
  {
    "id": "segment_8_poly_13",
    "points": "225,259 235,260 226,288",
    "defaultFill": "#0c213c",
    "zone": "ear_near"
  },
  {
    "id": "segment_2_poly_1",
    "points": "244,274 235,260 235,252",
    "defaultFill": "#6f9dc1",
    "zone": "ear_near"
  },
  {
    "id": "segment_1_poly_11",
    "points": "235,260 225,259 235,252",
    "defaultFill": "#477090",
    "zone": "ear_near"
  },
  {
    "id": "segment_1_poly_12",
    "points": "226,288 215,294 214,261",
    "defaultFill": "#3f6280",
    "zone": "ear_near"
  },
  {
    "id": "segment_1_poly_13",
    "points": "215,294 202,290 214,261",
    "defaultFill": "#3f5f78",
    "zone": "ear_near"
  },
  {
    "id": "segment_10_poly_9",
    "points": "154,313 160,297 181,294",
    "defaultFill": "#273f61",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_3",
    "points": "160,297 154,313 143,302",
    "defaultFill": "#2b4866",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_4",
    "points": "163,492 195,491 194,515",
    "defaultFill": "#344b6b",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_5",
    "points": "195,491 204,509 194,515",
    "defaultFill": "#304361",
    "zone": "tail"
  },
  {
    "id": "segment_5_poly_7",
    "points": "241,500 246,444 289,454",
    "defaultFill": "#1b334f",
    "zone": "tail"
  },
  {
    "id": "segment_2_poly_2",
    "points": "226,305 215,294 226,288",
    "defaultFill": "#7bacd4",
    "zone": "ear_near"
  },
  {
    "id": "segment_11_poly_6",
    "points": "244,274 248,316 226,288",
    "defaultFill": "#324a66",
    "zone": "ear_near"
  },
  {
    "id": "segment_8_poly_14",
    "points": "248,316 226,305 226,288",
    "defaultFill": "#101e3b",
    "zone": "ear_near"
  },
  {
    "id": "segment_10_poly_10",
    "points": "176,352 205,360 177,396",
    "defaultFill": "#2d3b55",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_7",
    "points": "154,313 196,313 176,352",
    "defaultFill": "#39546f",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_8",
    "points": "196,313 205,360 176,352",
    "defaultFill": "#39546f",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_14",
    "points": "215,294 196,313 202,290",
    "defaultFill": "#506f8c",
    "zone": "ear_near"
  },
  {
    "id": "segment_1_poly_15",
    "points": "354,352 348,335 396,354",
    "defaultFill": "#3e6181",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_16",
    "points": "388,397 354,352 396,354",
    "defaultFill": "#405f7c",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_8",
    "points": "414,424 370,445 388,397",
    "defaultFill": "#192d48",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_9",
    "points": "355,484 370,445 401,468",
    "defaultFill": "#213653",
    "zone": "tail"
  },
  {
    "id": "segment_4_poly_22",
    "points": "79,357 94,368 89,395",
    "defaultFill": "#0a1227",
    "zone": "ear_far"
  },
  {
    "id": "segment_11_poly_9",
    "points": "96,352 94,368 79,357",
    "defaultFill": "#3a4e69",
    "zone": "ear_far"
  },
  {
    "id": "segment_1_poly_17",
    "points": "101,362 94,368 96,352",
    "defaultFill": "#5b708f",
    "zone": "ear_far"
  },
  {
    "id": "segment_10_poly_11",
    "points": "124,344 176,352 162,379",
    "defaultFill": "#283955",
    "zone": "head"
  },
  {
    "id": "segment_10_poly_12",
    "points": "124,344 154,313 176,352",
    "defaultFill": "#273852",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_18",
    "points": "142,476 149,481 127,478",
    "defaultFill": "#5c7496",
    "zone": "unassigned"
  },
  {
    "id": "segment_8_poly_15",
    "points": "126,469 142,476 127,478",
    "defaultFill": "#091734",
    "zone": "unassigned"
  },
  {
    "id": "segment_8_poly_16",
    "points": "142,476 126,469 132,461",
    "defaultFill": "#031032",
    "zone": "unassigned"
  },
  {
    "id": "segment_4_poly_23",
    "points": "155,410 166,410 155,418",
    "defaultFill": "#2f120a",
    "zone": "eyes"
  },
  {
    "id": "segment_10_poly_13",
    "points": "123,450 157,427 132,461",
    "defaultFill": "#213c5a",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_24",
    "points": "110,447 123,450 111,459",
    "defaultFill": "#060d27",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_10",
    "points": "123,450 110,447 106,437",
    "defaultFill": "#2b4c79",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_17",
    "points": "131,422 123,450 106,437",
    "defaultFill": "#0f1c3f",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_18",
    "points": "123,450 126,469 111,459",
    "defaultFill": "#0e1831",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_19",
    "points": "126,469 123,450 132,461",
    "defaultFill": "#06142f",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_19",
    "points": "204,509 216,475 241,500",
    "defaultFill": "#3d5a78",
    "zone": "tail"
  },
  {
    "id": "segment_2_poly_3",
    "points": "195,491 216,475 204,509",
    "defaultFill": "#7192b1",
    "zone": "tail"
  },
  {
    "id": "segment_5_poly_10",
    "points": "246,444 275,433 289,454",
    "defaultFill": "#273f5b",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_2",
    "points": "228,384 222,377 234,383",
    "defaultFill": "#fff7f1",
    "zone": "eyes"
  },
  {
    "id": "segment_5_poly_11",
    "points": "285,360 262,359 266,332",
    "defaultFill": "#1d2e4a",
    "zone": "torso"
  },
  {
    "id": "segment_10_poly_14",
    "points": "190,301 154,313 181,294",
    "defaultFill": "#283b5b",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_11",
    "points": "190,301 196,313 154,313",
    "defaultFill": "#2e4360",
    "zone": "head"
  },
  {
    "id": "segment_10_poly_15",
    "points": "202,290 190,301 181,294",
    "defaultFill": "#16294a",
    "zone": "ear_near"
  },
  {
    "id": "segment_8_poly_20",
    "points": "196,313 190,301 202,290",
    "defaultFill": "#0b1933",
    "zone": "ear_near"
  },
  {
    "id": "segment_1_poly_20",
    "points": "205,360 212,317 222,320",
    "defaultFill": "#3e5d7a",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_21",
    "points": "196,313 212,317 205,360",
    "defaultFill": "#3f5c7a",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_12",
    "points": "320,364 354,352 388,397",
    "defaultFill": "#3a5572",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_13",
    "points": "354,352 320,364 348,335",
    "defaultFill": "#324969",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_12",
    "points": "278,387 320,364 293,436",
    "defaultFill": "#1d2d46",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_14",
    "points": "320,364 278,387 306,357",
    "defaultFill": "#304968",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_15",
    "points": "331,325 320,364 306,357",
    "defaultFill": "#314a69",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_16",
    "points": "320,364 331,325 348,335",
    "defaultFill": "#324968",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_13",
    "points": "409,449 396,450 414,432",
    "defaultFill": "#1f3c5a",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_22",
    "points": "396,450 414,424 414,432",
    "defaultFill": "#425f7f",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_14",
    "points": "396,450 370,445 414,424",
    "defaultFill": "#192d48",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_15",
    "points": "396,450 409,449 406,460",
    "defaultFill": "#23405e",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_16",
    "points": "396,450 406,460 401,468",
    "defaultFill": "#253a59",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_17",
    "points": "370,445 396,450 401,468",
    "defaultFill": "#1e324d",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_18",
    "points": "348,451 370,445 355,484",
    "defaultFill": "#273751",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_21",
    "points": "100,386 94,403 89,395",
    "defaultFill": "#14243d",
    "zone": "ear_far"
  },
  {
    "id": "segment_8_poly_22",
    "points": "94,368 100,386 89,395",
    "defaultFill": "#141f33",
    "zone": "ear_far"
  },
  {
    "id": "segment_8_poly_23",
    "points": "100,386 131,422 94,403",
    "defaultFill": "#0c1b30",
    "zone": "head"
  },
  {
    "id": "segment_10_poly_16",
    "points": "154,313 115,325 143,302",
    "defaultFill": "#1e2f49",
    "zone": "head"
  },
  {
    "id": "segment_10_poly_17",
    "points": "124,344 115,325 154,313",
    "defaultFill": "#20314b",
    "zone": "head"
  },
  {
    "id": "segment_10_poly_18",
    "points": "91,328 115,325 96,352",
    "defaultFill": "#1f304e",
    "zone": "ear_far"
  },
  {
    "id": "segment_8_poly_25",
    "points": "115,325 124,344 96,352",
    "defaultFill": "#071633",
    "zone": "ear_far"
  },
  {
    "id": "segment_3_poly_1",
    "points": "146,421 155,410 155,418",
    "defaultFill": "#8c442b",
    "zone": "eyes"
  },
  {
    "id": "segment_4_poly_25",
    "points": "155,410 146,421 131,422",
    "defaultFill": "#040002",
    "zone": "snout"
  },
  {
    "id": "segment_7_poly_2",
    "points": "157,427 146,421 155,418",
    "defaultFill": "#c18e5f",
    "zone": "eyes"
  },
  {
    "id": "segment_10_poly_19",
    "points": "123,450 146,421 157,427",
    "defaultFill": "#373341",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_26",
    "points": "146,421 123,450 131,422",
    "defaultFill": "#1f273c",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_17",
    "points": "155,410 162,388 166,410",
    "defaultFill": "#52494a",
    "zone": "eyes"
  },
  {
    "id": "segment_10_poly_20",
    "points": "177,396 162,388 162,379",
    "defaultFill": "#232e42",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_2",
    "points": "166,410 162,388 177,396",
    "defaultFill": "#2a242e",
    "zone": "eyes"
  },
  {
    "id": "segment_11_poly_18",
    "points": "214,406 179,425 177,396",
    "defaultFill": "#404352",
    "zone": "snout"
  },
  {
    "id": "segment_3_poly_2",
    "points": "166,410 179,425 166,423",
    "defaultFill": "#aa6846",
    "zone": "eyes"
  },
  {
    "id": "segment_4_poly_26",
    "points": "179,425 166,410 177,396",
    "defaultFill": "#0f0000",
    "zone": "eyes"
  },
  {
    "id": "segment_2_poly_4",
    "points": "170,459 195,491 163,492",
    "defaultFill": "#6987a1",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_19",
    "points": "149,481 170,459 163,492",
    "defaultFill": "#2e445c",
    "zone": "tail"
  },
  {
    "id": "segment_10_poly_21",
    "points": "142,476 170,459 149,481",
    "defaultFill": "#1e3851",
    "zone": "unassigned"
  },
  {
    "id": "segment_10_poly_22",
    "points": "157,427 170,459 132,461",
    "defaultFill": "#223d5b",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_23",
    "points": "170,459 142,476 132,461",
    "defaultFill": "#5e728a",
    "zone": "unassigned"
  },
  {
    "id": "segment_11_poly_20",
    "points": "289,454 282,437 293,436",
    "defaultFill": "#35556e",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_3",
    "points": "282,437 275,433 293,436",
    "defaultFill": "#99d4f4",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_19",
    "points": "275,433 282,437 289,454",
    "defaultFill": "#1d3654",
    "zone": "torso"
  },
  {
    "id": "segment_2_poly_5",
    "points": "226,432 242,433 230,439",
    "defaultFill": "#a0a9ae",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_27",
    "points": "269,424 275,433 246,444",
    "defaultFill": "#040e29",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_28",
    "points": "242,433 269,424 246,444",
    "defaultFill": "#06142e",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_29",
    "points": "269,424 278,387 293,436",
    "defaultFill": "#091731",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_30",
    "points": "275,433 269,424 293,436",
    "defaultFill": "#0a1833",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_20",
    "points": "269,370 262,359 285,360",
    "defaultFill": "#1e2f4b",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_24",
    "points": "262,359 269,370 260,371",
    "defaultFill": "#416e95",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_25",
    "points": "269,370 266,383 260,371",
    "defaultFill": "#427393",
    "zone": "head"
  },
  {
    "id": "segment_5_poly_21",
    "points": "269,370 285,360 278,387",
    "defaultFill": "#1c314e",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_22",
    "points": "266,383 269,370 278,387",
    "defaultFill": "#193153",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_21",
    "points": "262,359 243,335 266,332",
    "defaultFill": "#2e4964",
    "zone": "torso"
  },
  {
    "id": "segment_0_poly_3",
    "points": "222,377 241,379 234,383",
    "defaultFill": "#532e1b",
    "zone": "eyes"
  },
  {
    "id": "segment_1_poly_26",
    "points": "266,383 241,379 260,371",
    "defaultFill": "#51677c",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_27",
    "points": "217,310 196,313 215,294",
    "defaultFill": "#456983",
    "zone": "ear_near"
  },
  {
    "id": "segment_1_poly_28",
    "points": "217,310 212,317 196,313",
    "defaultFill": "#466584",
    "zone": "ear_near"
  },
  {
    "id": "segment_2_poly_6",
    "points": "226,305 217,310 215,294",
    "defaultFill": "#5a80a4",
    "zone": "ear_near"
  },
  {
    "id": "segment_1_poly_29",
    "points": "217,310 226,305 222,320",
    "defaultFill": "#436e91",
    "zone": "ear_near"
  },
  {
    "id": "segment_1_poly_30",
    "points": "212,317 217,310 222,320",
    "defaultFill": "#426384",
    "zone": "ear_near"
  },
  {
    "id": "segment_5_poly_23",
    "points": "336,446 320,364 388,397",
    "defaultFill": "#24354f",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_24",
    "points": "370,445 336,446 388,397",
    "defaultFill": "#1d2d47",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_29",
    "points": "348,451 336,446 370,445",
    "defaultFill": "#001435",
    "zone": "tail"
  },
  {
    "id": "segment_5_poly_25",
    "points": "320,364 336,446 293,436",
    "defaultFill": "#22324c",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_22",
    "points": "336,446 289,454 293,436",
    "defaultFill": "#314a68",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_23",
    "points": "336,446 355,484 289,454",
    "defaultFill": "#354f6a",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_24",
    "points": "336,446 348,451 355,484",
    "defaultFill": "#344e69",
    "zone": "tail"
  },
  {
    "id": "segment_10_poly_23",
    "points": "107,371 94,368 101,362",
    "defaultFill": "#1c3456",
    "zone": "ear_far"
  },
  {
    "id": "segment_4_poly_27",
    "points": "107,371 100,386 94,368",
    "defaultFill": "#0c1326",
    "zone": "ear_far"
  },
  {
    "id": "segment_10_poly_24",
    "points": "162,388 107,371 162,379",
    "defaultFill": "#1f2f48",
    "zone": "head"
  },
  {
    "id": "segment_10_poly_25",
    "points": "107,371 162,388 155,410",
    "defaultFill": "#21314a",
    "zone": "head"
  },
  {
    "id": "segment_10_poly_26",
    "points": "107,371 155,410 131,422",
    "defaultFill": "#1f2d47",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_31",
    "points": "100,386 107,371 131,422",
    "defaultFill": "#14223c",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_31",
    "points": "170,459 179,454 195,491",
    "defaultFill": "#5a7183",
    "zone": "tail"
  },
  {
    "id": "segment_2_poly_7",
    "points": "237,447 227,453 230,439",
    "defaultFill": "#8b95a1",
    "zone": "snout"
  },
  {
    "id": "segment_2_poly_8",
    "points": "242,433 237,447 230,439",
    "defaultFill": "#8494a4",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_4",
    "points": "237,447 242,433 246,444",
    "defaultFill": "#abd2f3",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_32",
    "points": "213,464 216,475 195,491",
    "defaultFill": "#597189",
    "zone": "tail"
  },
  {
    "id": "segment_1_poly_33",
    "points": "179,454 213,464 195,491",
    "defaultFill": "#54697e",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_25",
    "points": "213,464 179,454 189,449",
    "defaultFill": "#294d65",
    "zone": "snout"
  },
  {
    "id": "segment_3_poly_3",
    "points": "237,388 228,384 234,383",
    "defaultFill": "#a5683c",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_4",
    "points": "237,388 230,395 228,384",
    "defaultFill": "#491c05",
    "zone": "eyes"
  },
  {
    "id": "segment_3_poly_4",
    "points": "241,379 237,388 234,383",
    "defaultFill": "#936045",
    "zone": "eyes"
  },
  {
    "id": "segment_1_poly_34",
    "points": "237,388 241,379 266,383",
    "defaultFill": "#616469",
    "zone": "snout"
  },
  {
    "id": "segment_0_poly_5",
    "points": "230,395 220,393 228,384",
    "defaultFill": "#3f1f12",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_6",
    "points": "228,384 220,393 222,377",
    "defaultFill": "#341a0b",
    "zone": "eyes"
  },
  {
    "id": "segment_11_poly_26",
    "points": "220,393 214,406 177,396",
    "defaultFill": "#3e404d",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_35",
    "points": "226,404 226,432 214,406",
    "defaultFill": "#626470",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_28",
    "points": "220,393 226,404 214,406",
    "defaultFill": "#110000",
    "zone": "eyes"
  },
  {
    "id": "segment_3_poly_5",
    "points": "226,404 220,393 230,395",
    "defaultFill": "#af662f",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_7",
    "points": "214,436 226,432 230,439",
    "defaultFill": "#44372f",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_36",
    "points": "214,436 179,425 214,406",
    "defaultFill": "#675d5e",
    "zone": "snout"
  },
  {
    "id": "segment_3_poly_6",
    "points": "226,432 214,436 214,406",
    "defaultFill": "#8a786c",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_27",
    "points": "243,335 248,324 266,332",
    "defaultFill": "#325278",
    "zone": "torso"
  },
  {
    "id": "segment_1_poly_37",
    "points": "266,332 248,324 267,312",
    "defaultFill": "#3b5c7d",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_5",
    "points": "248,324 248,316 267,312",
    "defaultFill": "#93c1e2",
    "zone": "torso"
  },
  {
    "id": "segment_0_poly_8",
    "points": "220,393 215,367 222,377",
    "defaultFill": "#382d2b",
    "zone": "eyes"
  },
  {
    "id": "segment_10_poly_27",
    "points": "205,360 215,367 177,396",
    "defaultFill": "#323d51",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_28",
    "points": "215,367 220,393 177,396",
    "defaultFill": "#42404d",
    "zone": "eyes"
  },
  {
    "id": "segment_1_poly_38",
    "points": "249,369 243,335 262,359",
    "defaultFill": "#41678e",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_39",
    "points": "249,369 262,359 260,371",
    "defaultFill": "#406786",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_40",
    "points": "241,379 249,369 260,371",
    "defaultFill": "#596575",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_41",
    "points": "249,369 215,367 243,335",
    "defaultFill": "#445e79",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_29",
    "points": "249,369 241,379 222,377",
    "defaultFill": "#11080b",
    "zone": "eyes"
  },
  {
    "id": "segment_11_poly_29",
    "points": "215,367 249,369 222,377",
    "defaultFill": "#54454a",
    "zone": "eyes"
  },
  {
    "id": "segment_10_poly_28",
    "points": "112,363 107,371 101,362",
    "defaultFill": "#25395a",
    "zone": "ear_far"
  },
  {
    "id": "segment_10_poly_29",
    "points": "112,363 101,362 96,352",
    "defaultFill": "#1a3759",
    "zone": "ear_far"
  },
  {
    "id": "segment_10_poly_30",
    "points": "124,344 112,363 96,352",
    "defaultFill": "#263b5a",
    "zone": "ear_far"
  },
  {
    "id": "segment_10_poly_31",
    "points": "112,363 124,344 162,379",
    "defaultFill": "#1f2f48",
    "zone": "head"
  },
  {
    "id": "segment_10_poly_32",
    "points": "107,371 112,363 162,379",
    "defaultFill": "#1f2f48",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_30",
    "points": "183,443 170,459 157,427",
    "defaultFill": "#30445d",
    "zone": "snout"
  },
  {
    "id": "segment_2_poly_9",
    "points": "183,443 179,454 170,459",
    "defaultFill": "#77a5c6",
    "zone": "snout"
  },
  {
    "id": "segment_3_poly_7",
    "points": "183,443 157,427 166,423",
    "defaultFill": "#6b4f4b",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_31",
    "points": "179,425 183,443 166,423",
    "defaultFill": "#594b4a",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_32",
    "points": "179,454 183,443 189,449",
    "defaultFill": "#374c69",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_32",
    "points": "237,447 224,469 227,453",
    "defaultFill": "#001231",
    "zone": "snout"
  },
  {
    "id": "segment_5_poly_26",
    "points": "216,475 224,469 241,500",
    "defaultFill": "#152846",
    "zone": "tail"
  },
  {
    "id": "segment_5_poly_27",
    "points": "224,469 246,444 241,500",
    "defaultFill": "#1c344e",
    "zone": "tail"
  },
  {
    "id": "segment_2_poly_10",
    "points": "224,469 237,447 246,444",
    "defaultFill": "#7093af",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_28",
    "points": "213,464 224,469 216,475",
    "defaultFill": "#1c2f4f",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_33",
    "points": "251,413 269,424 242,433",
    "defaultFill": "#061127",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_34",
    "points": "251,413 266,383 278,387",
    "defaultFill": "#0f1b35",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_35",
    "points": "269,424 251,413 278,387",
    "defaultFill": "#030f29",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_36",
    "points": "224,469 218,452 227,453",
    "defaultFill": "#000b28",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_42",
    "points": "218,452 224,469 213,464",
    "defaultFill": "#557896",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_30",
    "points": "227,453 218,452 230,439",
    "defaultFill": "#0d111d",
    "zone": "snout"
  },
  {
    "id": "segment_0_poly_9",
    "points": "218,452 214,436 230,439",
    "defaultFill": "#4b3327",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_43",
    "points": "235,327 248,324 243,335",
    "defaultFill": "#3b6688",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_44",
    "points": "235,327 205,360 222,320",
    "defaultFill": "#3f5d79",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_45",
    "points": "248,324 235,327 248,316",
    "defaultFill": "#396789",
    "zone": "ear_near"
  },
  {
    "id": "segment_1_poly_46",
    "points": "235,327 215,367 205,360",
    "defaultFill": "#3e5d79",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_47",
    "points": "215,367 235,327 243,335",
    "defaultFill": "#3d5c79",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_37",
    "points": "226,305 235,327 222,320",
    "defaultFill": "#121e38",
    "zone": "ear_near"
  },
  {
    "id": "segment_8_poly_38",
    "points": "248,316 235,327 226,305",
    "defaultFill": "#081734",
    "zone": "ear_near"
  },
  {
    "id": "segment_7_poly_3",
    "points": "238,396 226,404 230,395",
    "defaultFill": "#f3ae77",
    "zone": "eyes"
  },
  {
    "id": "segment_1_poly_48",
    "points": "238,396 251,413 226,404",
    "defaultFill": "#6e6664",
    "zone": "snout"
  },
  {
    "id": "segment_7_poly_4",
    "points": "237,388 238,396 230,395",
    "defaultFill": "#e7a165",
    "zone": "eyes"
  },
  {
    "id": "segment_1_poly_49",
    "points": "238,396 237,388 266,383",
    "defaultFill": "#69696b",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_50",
    "points": "251,413 238,396 266,383",
    "defaultFill": "#4b6478",
    "zone": "snout"
  },
  {
    "id": "segment_2_poly_11",
    "points": "237,423 251,413 242,433",
    "defaultFill": "#6f8da9",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_33",
    "points": "251,413 237,423 226,404",
    "defaultFill": "#3d4c61",
    "zone": "snout"
  },
  {
    "id": "segment_2_poly_12",
    "points": "226,432 237,423 242,433",
    "defaultFill": "#90949d",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_51",
    "points": "226,404 237,423 226,432",
    "defaultFill": "#686c77",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_34",
    "points": "200,447 213,464 189,449",
    "defaultFill": "#364759",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_39",
    "points": "183,443 200,447 189,449",
    "defaultFill": "#19253d",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_35",
    "points": "214,436 200,447 179,425",
    "defaultFill": "#413f4a",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_40",
    "points": "200,447 183,443 179,425",
    "defaultFill": "#142038",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_36",
    "points": "211,445 218,452 213,464",
    "defaultFill": "#414c5e",
    "zone": "snout"
  },
  {
    "id": "segment_11_poly_37",
    "points": "200,447 211,445 213,464",
    "defaultFill": "#3f4b59",
    "zone": "snout"
  },
  {
    "id": "segment_0_poly_10",
    "points": "218,452 211,445 214,436",
    "defaultFill": "#453737",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_52",
    "points": "211,445 200,447 214,436",
    "defaultFill": "#61646b",
    "zone": "snout"
  }
];
