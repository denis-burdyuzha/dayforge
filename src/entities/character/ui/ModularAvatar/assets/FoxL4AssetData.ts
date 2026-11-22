export type FoxL4Zone = "armLeft" | "armRight" | "ears" | "eyes" | "head" | "legs" | "snout" | "tail" | "torso";

export interface FoxL4PolygonDef {
  id: string;
  points: string;
  defaultFill: string;
  /** Anatomical zone from foxL4_grouped.svg (`unassigned` = not classified) */
  zone: FoxL4Zone;
}

export const FOX_L4_POLYGONS: FoxL4PolygonDef[] = [
  {
    "id": "segment_5_poly_3",
    "points": "203,589 213,525 229,525",
    "defaultFill": "#031c3b",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_1",
    "points": "213,525 202,463 229,525",
    "defaultFill": "#88a9d2",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_4",
    "points": "202,463 213,525 196,521",
    "defaultFill": "#051129",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_9",
    "points": "239,590 203,589 229,525",
    "defaultFill": "#0e1420",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_10",
    "points": "192,587 182,594 196,521",
    "defaultFill": "#00112e",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_11",
    "points": "213,525 192,587 196,521",
    "defaultFill": "#09132c",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_12",
    "points": "192,587 213,525 203,589",
    "defaultFill": "#16253c",
    "zone": "legs"
  },
  {
    "id": "segment_9_poly_1",
    "points": "259,28 270,14 273,42",
    "defaultFill": "#0e2c50",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_1",
    "points": "234,62 259,28 273,42",
    "defaultFill": "#3d6485",
    "zone": "ears"
  },
  {
    "id": "segment_5_poly_15",
    "points": "190,459 202,463 196,521",
    "defaultFill": "#061127",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_16",
    "points": "175,460 190,459 196,521",
    "defaultFill": "#031227",
    "zone": "legs"
  },
  {
    "id": "segment_0_poly_1",
    "points": "267,461 257,424 285,361",
    "defaultFill": "#304564",
    "zone": "legs"
  },
  {
    "id": "segment_6_poly_1",
    "points": "257,424 221,367 285,361",
    "defaultFill": "#091430",
    "zone": "legs"
  },
  {
    "id": "segment_6_poly_2",
    "points": "188,331 158,360 165,328",
    "defaultFill": "#09152f",
    "zone": "legs"
  },
  {
    "id": "segment_9_poly_2",
    "points": "158,360 188,331 221,367",
    "defaultFill": "#1b2c46",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_1",
    "points": "37,214 57,200 67,216",
    "defaultFill": "#8b8180",
    "zone": "tail"
  },
  {
    "id": "segment_2_poly_12",
    "points": "81,311 52,270 82,285",
    "defaultFill": "#11152e",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_1",
    "points": "97,151 96,137 104,133",
    "defaultFill": "#664e42",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_2",
    "points": "97,151 111,162 95,181",
    "defaultFill": "#3c3139",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_2",
    "points": "111,162 145,187 95,181",
    "defaultFill": "#2b435b",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_3",
    "points": "111,162 97,151 104,133",
    "defaultFill": "#584036",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_3",
    "points": "253,603 250,587 258,594",
    "defaultFill": "#153b62",
    "zone": "legs"
  },
  {
    "id": "segment_0_poly_4",
    "points": "239,590 250,587 253,603",
    "defaultFill": "#273e5d",
    "zone": "legs"
  },
  {
    "id": "segment_7_poly_2",
    "points": "250,587 246,521 258,594",
    "defaultFill": "#7a9bbe",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_18",
    "points": "250,587 239,590 229,525",
    "defaultFill": "#12223c",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_19",
    "points": "246,521 250,587 229,525",
    "defaultFill": "#18243c",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_21",
    "points": "240,603 239,590 253,603",
    "defaultFill": "#002144",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_22",
    "points": "192,587 190,595 182,594",
    "defaultFill": "#00244b",
    "zone": "legs"
  },
  {
    "id": "segment_0_poly_5",
    "points": "202,603 190,595 203,589",
    "defaultFill": "#203958",
    "zone": "legs"
  },
  {
    "id": "segment_0_poly_6",
    "points": "190,595 192,587 203,589",
    "defaultFill": "#213858",
    "zone": "legs"
  },
  {
    "id": "segment_6_poly_3",
    "points": "167,316 165,328 126,334",
    "defaultFill": "#051129",
    "zone": "tail"
  },
  {
    "id": "segment_6_poly_4",
    "points": "116,300 81,311 82,285",
    "defaultFill": "#0d1732",
    "zone": "tail"
  },
  {
    "id": "segment_4_poly_2",
    "points": "221,63 242,70 220,92",
    "defaultFill": "#41637f",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_3",
    "points": "242,70 221,63 234,62",
    "defaultFill": "#365778",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_4",
    "points": "271,75 268,65 273,42",
    "defaultFill": "#4f7898",
    "zone": "ears"
  },
  {
    "id": "segment_9_poly_3",
    "points": "252,76 268,65 271,75",
    "defaultFill": "#192d46",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_4",
    "points": "242,70 268,65 252,76",
    "defaultFill": "#152d4f",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_5",
    "points": "268,65 234,62 273,42",
    "defaultFill": "#1a2e49",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_5",
    "points": "268,65 242,70 234,62",
    "defaultFill": "#3f5e7d",
    "zone": "head"
  },
  {
    "id": "segment_3_poly_1",
    "points": "350,110 359,105 346,136",
    "defaultFill": "#765743",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_2",
    "points": "339,111 350,110 346,136",
    "defaultFill": "#bf885f",
    "zone": "tail"
  },
  {
    "id": "segment_1_poly_1",
    "points": "350,110 339,111 359,105",
    "defaultFill": "#f6e2d7",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_6",
    "points": "228,317 213,320 221,312",
    "defaultFill": "#082851",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_5",
    "points": "188,331 213,320 221,367",
    "defaultFill": "#101b31",
    "zone": "legs"
  },
  {
    "id": "segment_6_poly_6",
    "points": "213,320 228,317 221,367",
    "defaultFill": "#0f1932",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_23",
    "points": "184,425 190,459 175,460",
    "defaultFill": "#101c36",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_24",
    "points": "158,360 184,425 175,460",
    "defaultFill": "#0c1832",
    "zone": "legs"
  },
  {
    "id": "segment_6_poly_7",
    "points": "184,425 158,360 221,367",
    "defaultFill": "#132440",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_25",
    "points": "257,424 184,425 221,367",
    "defaultFill": "#0b1225",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_26",
    "points": "232,449 184,425 257,424",
    "defaultFill": "#0d141e",
    "zone": "legs"
  },
  {
    "id": "segment_6_poly_8",
    "points": "222,311 228,317 221,312",
    "defaultFill": "#011b40",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_6",
    "points": "233,208 209,206 222,192",
    "defaultFill": "#445d7c",
    "zone": "torso"
  },
  {
    "id": "segment_2_poly_14",
    "points": "173,22 191,76 180,90",
    "defaultFill": "#09132c",
    "zone": "ears"
  },
  {
    "id": "segment_3_poly_2",
    "points": "123,125 110,123 104,112",
    "defaultFill": "#7e655e",
    "zone": "tail"
  },
  {
    "id": "segment_1_poly_2",
    "points": "110,123 123,125 104,133",
    "defaultFill": "#ceb7a9",
    "zone": "tail"
  },
  {
    "id": "segment_3_poly_3",
    "points": "55,232 37,214 67,216",
    "defaultFill": "#6f5850",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_7",
    "points": "86,222 55,232 67,216",
    "defaultFill": "#343f5d",
    "zone": "tail"
  },
  {
    "id": "segment_4_poly_7",
    "points": "72,208 86,222 67,216",
    "defaultFill": "#3b5c7b",
    "zone": "tail"
  },
  {
    "id": "segment_4_poly_8",
    "points": "57,200 72,208 67,216",
    "defaultFill": "#495b73",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_7",
    "points": "145,206 142,216 95,181",
    "defaultFill": "#162542",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_8",
    "points": "145,187 145,206 95,181",
    "defaultFill": "#172844",
    "zone": "tail"
  },
  {
    "id": "segment_6_poly_9",
    "points": "145,206 145,187 174,208",
    "defaultFill": "#12213e",
    "zone": "armLeft"
  },
  {
    "id": "segment_6_poly_10",
    "points": "170,226 145,206 174,208",
    "defaultFill": "#091933",
    "zone": "armLeft"
  },
  {
    "id": "segment_6_poly_11",
    "points": "145,206 170,226 142,216",
    "defaultFill": "#142038",
    "zone": "armLeft"
  },
  {
    "id": "segment_8_poly_3",
    "points": "104,112 90,117 82,105",
    "defaultFill": "#af866a",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_4",
    "points": "96,137 90,117 104,133",
    "defaultFill": "#694431",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_4",
    "points": "90,117 110,123 104,133",
    "defaultFill": "#b28460",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_5",
    "points": "110,123 90,117 104,112",
    "defaultFill": "#aa7e5b",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_8",
    "points": "111,162 132,156 145,187",
    "defaultFill": "#32435d",
    "zone": "tail"
  },
  {
    "id": "segment_4_poly_9",
    "points": "132,156 123,125 143,156",
    "defaultFill": "#49586f",
    "zone": "tail"
  },
  {
    "id": "segment_3_poly_4",
    "points": "132,156 111,162 104,133",
    "defaultFill": "#766257",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_6",
    "points": "123,125 132,156 104,133",
    "defaultFill": "#8f7e76",
    "zone": "tail"
  },
  {
    "id": "segment_5_poly_27",
    "points": "212,600 202,603 203,589",
    "defaultFill": "#1d2d47",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_28",
    "points": "239,590 212,600 203,589",
    "defaultFill": "#0f111d",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_30",
    "points": "186,602 190,595 202,603",
    "defaultFill": "#122438",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_31",
    "points": "190,595 186,602 182,594",
    "defaultFill": "#00183b",
    "zone": "legs"
  },
  {
    "id": "segment_2_poly_22",
    "points": "81,311 116,315 126,334",
    "defaultFill": "#090f29",
    "zone": "tail"
  },
  {
    "id": "segment_2_poly_23",
    "points": "116,300 116,315 81,311",
    "defaultFill": "#07112a",
    "zone": "tail"
  },
  {
    "id": "segment_2_poly_24",
    "points": "116,315 167,316 126,334",
    "defaultFill": "#060e23",
    "zone": "tail"
  },
  {
    "id": "segment_6_poly_12",
    "points": "167,316 116,315 141,284",
    "defaultFill": "#0c162f",
    "zone": "tail"
  },
  {
    "id": "segment_6_poly_13",
    "points": "116,315 116,300 141,284",
    "defaultFill": "#0e152f",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_5",
    "points": "349,184 330,160 346,136",
    "defaultFill": "#4d3f3c",
    "zone": "tail"
  },
  {
    "id": "segment_3_poly_5",
    "points": "316,131 330,160 310,156",
    "defaultFill": "#6d5f5c",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_7",
    "points": "336,133 339,111 346,136",
    "defaultFill": "#a68262",
    "zone": "tail"
  },
  {
    "id": "segment_3_poly_6",
    "points": "336,133 327,119 339,111",
    "defaultFill": "#8a6753",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_6",
    "points": "330,160 336,133 346,136",
    "defaultFill": "#63493c",
    "zone": "tail"
  },
  {
    "id": "segment_3_poly_7",
    "points": "336,133 330,160 316,131",
    "defaultFill": "#8e694f",
    "zone": "tail"
  },
  {
    "id": "segment_3_poly_8",
    "points": "336,133 316,131 319,123",
    "defaultFill": "#735f56",
    "zone": "tail"
  },
  {
    "id": "segment_3_poly_9",
    "points": "327,119 336,133 319,123",
    "defaultFill": "#7a6258",
    "zone": "tail"
  },
  {
    "id": "segment_7_poly_3",
    "points": "208,305 222,311 221,312",
    "defaultFill": "#678cb9",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_4",
    "points": "222,311 208,305 221,297",
    "defaultFill": "#7b95ba",
    "zone": "torso"
  },
  {
    "id": "segment_0_poly_9",
    "points": "241,462 257,424 267,461",
    "defaultFill": "#2b3a57",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_35",
    "points": "241,462 232,449 257,424",
    "defaultFill": "#0c1429",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_36",
    "points": "246,521 241,462 267,461",
    "defaultFill": "#040e27",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_37",
    "points": "232,449 241,462 202,463",
    "defaultFill": "#121621",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_38",
    "points": "202,463 241,462 229,525",
    "defaultFill": "#0c131b",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_39",
    "points": "241,462 246,521 229,525",
    "defaultFill": "#0b152e",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_40",
    "points": "208,450 232,449 202,463",
    "defaultFill": "#0e142a",
    "zone": "legs"
  },
  {
    "id": "segment_9_poly_9",
    "points": "208,450 184,425 232,449",
    "defaultFill": "#152d49",
    "zone": "legs"
  },
  {
    "id": "segment_6_poly_14",
    "points": "190,459 208,450 202,463",
    "defaultFill": "#102540",
    "zone": "legs"
  },
  {
    "id": "segment_0_poly_10",
    "points": "184,425 208,450 190,459",
    "defaultFill": "#2b3e5c",
    "zone": "legs"
  },
  {
    "id": "segment_8_poly_8",
    "points": "417,211 410,198 431,205",
    "defaultFill": "#b78b66",
    "zone": "tail"
  },
  {
    "id": "segment_7_poly_5",
    "points": "228,246 217,242 219,234",
    "defaultFill": "#608fbd",
    "zone": "armLeft"
  },
  {
    "id": "segment_4_poly_10",
    "points": "217,242 205,234 219,234",
    "defaultFill": "#315378",
    "zone": "armLeft"
  },
  {
    "id": "segment_7_poly_6",
    "points": "205,234 217,242 203,247",
    "defaultFill": "#9abce1",
    "zone": "armLeft"
  },
  {
    "id": "segment_6_poly_15",
    "points": "205,234 203,247 170,226",
    "defaultFill": "#07132d",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_16",
    "points": "205,234 170,226 174,208",
    "defaultFill": "#12223c",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_17",
    "points": "209,206 205,234 174,208",
    "defaultFill": "#13233d",
    "zone": "torso"
  },
  {
    "id": "segment_0_poly_11",
    "points": "209,206 199,194 222,192",
    "defaultFill": "#263e5a",
    "zone": "torso"
  },
  {
    "id": "segment_0_poly_12",
    "points": "199,194 205,177 222,192",
    "defaultFill": "#283f5f",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_18",
    "points": "199,194 209,206 174,208",
    "defaultFill": "#13213b",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_19",
    "points": "237,232 228,246 219,234",
    "defaultFill": "#001739",
    "zone": "armLeft"
  },
  {
    "id": "segment_2_poly_25",
    "points": "183,28 191,76 173,22",
    "defaultFill": "#000422",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_11",
    "points": "183,28 173,22 172,14",
    "defaultFill": "#48729a",
    "zone": "ears"
  },
  {
    "id": "segment_9_poly_10",
    "points": "191,76 193,105 180,90",
    "defaultFill": "#1b2a41",
    "zone": "head"
  },
  {
    "id": "segment_11_poly_7",
    "points": "26,212 37,214 30,219",
    "defaultFill": "#6f4d41",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_8",
    "points": "40,236 55,232 52,270",
    "defaultFill": "#3c363a",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_9",
    "points": "37,214 40,236 30,219",
    "defaultFill": "#483730",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_10",
    "points": "55,232 40,236 37,214",
    "defaultFill": "#60433b",
    "zone": "tail"
  },
  {
    "id": "segment_6_poly_21",
    "points": "52,270 98,245 82,285",
    "defaultFill": "#112540",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_11",
    "points": "55,232 98,245 52,270",
    "defaultFill": "#1e2a40",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_13",
    "points": "98,245 55,232 86,222",
    "defaultFill": "#2a3e59",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_12",
    "points": "141,259 124,261 142,216",
    "defaultFill": "#102749",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_14",
    "points": "126,279 116,300 82,285",
    "defaultFill": "#2b4261",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_15",
    "points": "240,603 232,599 239,590",
    "defaultFill": "#23384d",
    "zone": "legs"
  },
  {
    "id": "segment_5_poly_41",
    "points": "232,599 212,600 239,590",
    "defaultFill": "#0e142a",
    "zone": "legs"
  },
  {
    "id": "segment_9_poly_13",
    "points": "258,83 252,76 271,75",
    "defaultFill": "#0e2746",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_12",
    "points": "258,83 249,105 252,76",
    "defaultFill": "#3e5d79",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_13",
    "points": "262,90 258,83 271,75",
    "defaultFill": "#446380",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_14",
    "points": "258,83 262,90 249,105",
    "defaultFill": "#3f5a78",
    "zone": "head"
  },
  {
    "id": "segment_6_poly_23",
    "points": "207,313 213,320 188,331",
    "defaultFill": "#0e1a34",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_7",
    "points": "213,320 207,313 221,312",
    "defaultFill": "#7ca2cf",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_8",
    "points": "207,313 208,305 221,312",
    "defaultFill": "#7ba2cd",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_24",
    "points": "228,246 250,270 225,255",
    "defaultFill": "#0e1c37",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_25",
    "points": "237,232 250,270 228,246",
    "defaultFill": "#0f1d3a",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_26",
    "points": "250,270 237,232 266,233",
    "defaultFill": "#0b1933",
    "zone": "torso"
  },
  {
    "id": "segment_10_poly_17",
    "points": "360,285 386,273 360,311",
    "defaultFill": "#10182f",
    "zone": "tail"
  },
  {
    "id": "segment_6_poly_27",
    "points": "386,273 360,285 390,265",
    "defaultFill": "#14223d",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_14",
    "points": "302,284 314,277 319,301",
    "defaultFill": "#183054",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_28",
    "points": "314,277 302,284 305,259",
    "defaultFill": "#0c1f3d",
    "zone": "armRight"
  },
  {
    "id": "segment_10_poly_20",
    "points": "352,290 360,285 360,311",
    "defaultFill": "#0b1530",
    "zone": "tail"
  },
  {
    "id": "segment_6_poly_29",
    "points": "322,315 352,290 360,311",
    "defaultFill": "#0e1833",
    "zone": "tail"
  },
  {
    "id": "segment_10_poly_21",
    "points": "352,290 322,315 319,301",
    "defaultFill": "#0b132a",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_16",
    "points": "314,277 352,290 319,301",
    "defaultFill": "#334768",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_17",
    "points": "360,285 352,290 318,260",
    "defaultFill": "#304864",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_18",
    "points": "338,233 360,285 318,260",
    "defaultFill": "#2b4866",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_19",
    "points": "360,285 338,233 390,265",
    "defaultFill": "#304862",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_20",
    "points": "338,233 356,222 390,265",
    "defaultFill": "#334a69",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_15",
    "points": "356,222 386,232 390,265",
    "defaultFill": "#2e3649",
    "zone": "tail"
  },
  {
    "id": "segment_6_poly_30",
    "points": "217,265 216,251 225,255",
    "defaultFill": "#09152f",
    "zone": "armLeft"
  },
  {
    "id": "segment_6_poly_31",
    "points": "216,251 217,265 203,247",
    "defaultFill": "#101a33",
    "zone": "armLeft"
  },
  {
    "id": "segment_7_poly_9",
    "points": "217,242 216,251 203,247",
    "defaultFill": "#779cc6",
    "zone": "armLeft"
  },
  {
    "id": "segment_6_poly_32",
    "points": "216,251 228,246 225,255",
    "defaultFill": "#0a1c40",
    "zone": "armLeft"
  },
  {
    "id": "segment_9_poly_16",
    "points": "216,251 217,242 228,246",
    "defaultFill": "#132742",
    "zone": "armLeft"
  },
  {
    "id": "segment_6_poly_33",
    "points": "289,258 266,233 272,225",
    "defaultFill": "#0a1936",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_34",
    "points": "158,173 150,178 143,156",
    "defaultFill": "#0b1936",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_21",
    "points": "150,178 132,156 143,156",
    "defaultFill": "#2b4664",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_22",
    "points": "132,156 150,178 145,187",
    "defaultFill": "#2d4567",
    "zone": "tail"
  },
  {
    "id": "segment_6_poly_35",
    "points": "145,187 150,178 174,208",
    "defaultFill": "#0b1c3a",
    "zone": "armLeft"
  },
  {
    "id": "segment_6_poly_36",
    "points": "150,178 158,173 174,208",
    "defaultFill": "#0d1834",
    "zone": "armLeft"
  },
  {
    "id": "segment_9_poly_17",
    "points": "237,232 227,220 233,208",
    "defaultFill": "#223651",
    "zone": "armLeft"
  },
  {
    "id": "segment_4_poly_15",
    "points": "233,208 227,220 209,206",
    "defaultFill": "#406180",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_18",
    "points": "259,227 237,232 233,208",
    "defaultFill": "#243a52",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_37",
    "points": "237,232 259,227 266,233",
    "defaultFill": "#101e38",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_38",
    "points": "266,233 259,227 272,225",
    "defaultFill": "#0f203e",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_19",
    "points": "237,140 241,151 227,151",
    "defaultFill": "#092b50",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_16",
    "points": "241,151 247,166 227,151",
    "defaultFill": "#3d5b77",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_17",
    "points": "237,178 233,208 222,192",
    "defaultFill": "#456783",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_18",
    "points": "237,178 255,178 233,208",
    "defaultFill": "#3a5e7e",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_19",
    "points": "237,178 247,166 255,178",
    "defaultFill": "#3f607f",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_20",
    "points": "247,166 237,178 227,151",
    "defaultFill": "#3c5a76",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_21",
    "points": "237,178 205,177 227,151",
    "defaultFill": "#3b5975",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_22",
    "points": "205,177 237,178 222,192",
    "defaultFill": "#3a5874",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_23",
    "points": "183,28 209,60 191,76",
    "defaultFill": "#3d5a7c",
    "zone": "ears"
  },
  {
    "id": "segment_9_poly_20",
    "points": "174,121 193,105 182,124",
    "defaultFill": "#1f2b43",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_21",
    "points": "174,121 166,118 180,90",
    "defaultFill": "#17385b",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_22",
    "points": "193,105 174,121 180,90",
    "defaultFill": "#1e2f49",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_9",
    "points": "198,112 193,105 211,102",
    "defaultFill": "#c3a372",
    "zone": "eyes"
  },
  {
    "id": "segment_11_poly_11",
    "points": "193,105 198,112 182,124",
    "defaultFill": "#543f46",
    "zone": "eyes"
  },
  {
    "id": "segment_8_poly_10",
    "points": "18,209 26,212 30,219",
    "defaultFill": "#a48d7f",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_12",
    "points": "40,236 18,209 30,219",
    "defaultFill": "#3a2824",
    "zone": "tail"
  },
  {
    "id": "segment_3_poly_10",
    "points": "37,214 33,198 57,200",
    "defaultFill": "#7d6559",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_11",
    "points": "26,212 33,198 37,214",
    "defaultFill": "#ae7c5b",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_12",
    "points": "18,209 33,198 26,212",
    "defaultFill": "#bf8659",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_13",
    "points": "33,198 18,209 11,205",
    "defaultFill": "#a88160",
    "zone": "tail"
  },
  {
    "id": "segment_6_poly_39",
    "points": "116,300 133,284 141,284",
    "defaultFill": "#121c35",
    "zone": "tail"
  },
  {
    "id": "segment_6_poly_40",
    "points": "126,279 133,284 116,300",
    "defaultFill": "#0f152d",
    "zone": "tail"
  },
  {
    "id": "segment_6_poly_41",
    "points": "133,284 141,259 141,284",
    "defaultFill": "#0f1932",
    "zone": "armLeft"
  },
  {
    "id": "segment_6_poly_42",
    "points": "133,284 126,279 141,259",
    "defaultFill": "#0e152f",
    "zone": "armLeft"
  },
  {
    "id": "segment_9_poly_23",
    "points": "141,259 123,269 124,261",
    "defaultFill": "#193356",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_24",
    "points": "126,279 123,269 141,259",
    "defaultFill": "#1d2b46",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_23",
    "points": "123,269 126,279 82,285",
    "defaultFill": "#2e3e58",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_24",
    "points": "98,245 123,269 82,285",
    "defaultFill": "#293e59",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_25",
    "points": "330,160 294,186 310,156",
    "defaultFill": "#223651",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_25",
    "points": "294,186 330,160 349,184",
    "defaultFill": "#304967",
    "zone": "tail"
  },
  {
    "id": "segment_4_poly_24",
    "points": "249,105 267,121 244,112",
    "defaultFill": "#646776",
    "zone": "eyes"
  },
  {
    "id": "segment_4_poly_25",
    "points": "262,90 267,121 249,105",
    "defaultFill": "#3e6b88",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_26",
    "points": "276,118 267,121 262,90",
    "defaultFill": "#366485",
    "zone": "head"
  },
  {
    "id": "segment_1_poly_3",
    "points": "232,105 249,105 244,112",
    "defaultFill": "#fde0a4",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_26",
    "points": "232,105 211,102 220,92",
    "defaultFill": "#2e4863",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_27",
    "points": "249,105 232,105 252,76",
    "defaultFill": "#455d77",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_28",
    "points": "242,70 232,105 220,92",
    "defaultFill": "#476682",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_10",
    "points": "232,105 242,70 252,76",
    "defaultFill": "#7195b7",
    "zone": "head"
  },
  {
    "id": "segment_3_poly_11",
    "points": "207,115 198,112 211,102",
    "defaultFill": "#815c2f",
    "zone": "eyes"
  },
  {
    "id": "segment_11_poly_13",
    "points": "198,112 207,115 200,128",
    "defaultFill": "#583d46",
    "zone": "eyes"
  },
  {
    "id": "segment_0_poly_27",
    "points": "232,105 207,115 211,102",
    "defaultFill": "#324661",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_29",
    "points": "207,115 232,105 230,123",
    "defaultFill": "#47617a",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_26",
    "points": "207,115 216,138 200,128",
    "defaultFill": "#16243f",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_30",
    "points": "216,138 207,115 230,123",
    "defaultFill": "#3f5a77",
    "zone": "snout"
  },
  {
    "id": "segment_6_poly_44",
    "points": "141,259 154,258 141,284",
    "defaultFill": "#11213b",
    "zone": "armLeft"
  },
  {
    "id": "segment_2_poly_41",
    "points": "170,226 154,258 142,216",
    "defaultFill": "#050f28",
    "zone": "armLeft"
  },
  {
    "id": "segment_6_poly_45",
    "points": "154,258 141,259 142,216",
    "defaultFill": "#10203a",
    "zone": "armLeft"
  },
  {
    "id": "segment_6_poly_46",
    "points": "174,296 180,282 208,305",
    "defaultFill": "#04132a",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_47",
    "points": "180,282 200,277 208,305",
    "defaultFill": "#0d1730",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_48",
    "points": "208,305 200,277 221,297",
    "defaultFill": "#10182f",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_49",
    "points": "217,265 232,292 221,297",
    "defaultFill": "#101e39",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_27",
    "points": "252,300 264,288 267,296",
    "defaultFill": "#10264d",
    "zone": "armRight"
  },
  {
    "id": "segment_10_poly_23",
    "points": "316,334 322,315 360,311",
    "defaultFill": "#0b122c",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_28",
    "points": "352,290 316,269 318,260",
    "defaultFill": "#213b5c",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_29",
    "points": "316,269 352,290 314,277",
    "defaultFill": "#283c57",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_30",
    "points": "316,269 305,259 318,260",
    "defaultFill": "#2d5078",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_31",
    "points": "316,269 314,277 305,259",
    "defaultFill": "#394c6c",
    "zone": "armRight"
  },
  {
    "id": "segment_10_poly_26",
    "points": "311,239 338,233 318,260",
    "defaultFill": "#0f172e",
    "zone": "tail"
  },
  {
    "id": "segment_4_poly_31",
    "points": "305,259 311,239 318,260",
    "defaultFill": "#326082",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_32",
    "points": "300,215 311,239 272,225",
    "defaultFill": "#364d6d",
    "zone": "armRight"
  },
  {
    "id": "segment_9_poly_28",
    "points": "311,239 289,258 272,225",
    "defaultFill": "#122543",
    "zone": "armRight"
  },
  {
    "id": "segment_9_poly_29",
    "points": "356,222 324,220 349,184",
    "defaultFill": "#193250",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_30",
    "points": "338,233 324,220 356,222",
    "defaultFill": "#10284a",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_31",
    "points": "297,207 324,220 300,215",
    "defaultFill": "#20344d",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_32",
    "points": "324,220 311,239 300,215",
    "defaultFill": "#1f384c",
    "zone": "tail"
  },
  {
    "id": "segment_10_poly_27",
    "points": "311,239 324,220 338,233",
    "defaultFill": "#0f172c",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_33",
    "points": "324,220 294,186 349,184",
    "defaultFill": "#354e6d",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_33",
    "points": "294,186 324,220 297,207",
    "defaultFill": "#21374f",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_14",
    "points": "386,232 403,233 390,265",
    "defaultFill": "#493d3f",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_34",
    "points": "199,194 185,173 205,177",
    "defaultFill": "#1a2d4b",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_35",
    "points": "185,173 190,151 205,177",
    "defaultFill": "#0e2243",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_36",
    "points": "190,151 185,173 179,164",
    "defaultFill": "#182f51",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_50",
    "points": "185,173 199,194 174,208",
    "defaultFill": "#121933",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_51",
    "points": "158,173 185,173 174,208",
    "defaultFill": "#111c38",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_37",
    "points": "179,164 185,173 158,173",
    "defaultFill": "#1e3152",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_38",
    "points": "223,227 205,234 209,206",
    "defaultFill": "#122641",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_39",
    "points": "205,234 223,227 219,234",
    "defaultFill": "#0a2957",
    "zone": "armLeft"
  },
  {
    "id": "segment_7_poly_11",
    "points": "227,220 223,227 209,206",
    "defaultFill": "#6783a8",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_12",
    "points": "223,227 237,232 219,234",
    "defaultFill": "#92b4e1",
    "zone": "armLeft"
  },
  {
    "id": "segment_0_poly_34",
    "points": "223,227 227,220 237,232",
    "defaultFill": "#2a4c71",
    "zone": "armLeft"
  },
  {
    "id": "segment_9_poly_40",
    "points": "255,178 269,207 233,208",
    "defaultFill": "#22364f",
    "zone": "torso"
  },
  {
    "id": "segment_0_poly_35",
    "points": "269,207 259,227 233,208",
    "defaultFill": "#273f57",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_52",
    "points": "259,227 269,207 272,225",
    "defaultFill": "#0f1e3f",
    "zone": "torso"
  },
  {
    "id": "segment_0_poly_36",
    "points": "284,174 269,207 255,178",
    "defaultFill": "#274662",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_32",
    "points": "209,60 199,74 191,76",
    "defaultFill": "#476d91",
    "zone": "head"
  },
  {
    "id": "segment_0_poly_37",
    "points": "211,102 199,74 220,92",
    "defaultFill": "#2b3f5a",
    "zone": "head"
  },
  {
    "id": "segment_0_poly_38",
    "points": "199,74 221,63 220,92",
    "defaultFill": "#2c405b",
    "zone": "head"
  },
  {
    "id": "segment_0_poly_39",
    "points": "199,74 209,60 221,63",
    "defaultFill": "#264468",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_41",
    "points": "193,105 199,74 211,102",
    "defaultFill": "#1d2941",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_42",
    "points": "199,74 193,105 191,76",
    "defaultFill": "#192a44",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_43",
    "points": "198,112 193,124 182,124",
    "defaultFill": "#212842",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_44",
    "points": "193,124 198,112 200,128",
    "defaultFill": "#2c2e3a",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_33",
    "points": "247,166 263,164 255,178",
    "defaultFill": "#476d91",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_34",
    "points": "263,164 284,174 255,178",
    "defaultFill": "#416a8a",
    "zone": "torso"
  },
  {
    "id": "segment_0_poly_40",
    "points": "294,186 292,178 310,156",
    "defaultFill": "#2d476c",
    "zone": "tail"
  },
  {
    "id": "segment_7_poly_13",
    "points": "292,178 294,186 284,174",
    "defaultFill": "#9cd6fb",
    "zone": "armRight"
  },
  {
    "id": "segment_7_poly_14",
    "points": "267,121 254,133 244,112",
    "defaultFill": "#8ab8dc",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_4",
    "points": "235,115 232,105 244,112",
    "defaultFill": "#f7d399",
    "zone": "eyes"
  },
  {
    "id": "segment_11_poly_15",
    "points": "232,105 235,115 230,123",
    "defaultFill": "#56413e",
    "zone": "eyes"
  },
  {
    "id": "segment_4_poly_35",
    "points": "226,140 237,140 227,151",
    "defaultFill": "#476b85",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_36",
    "points": "226,140 216,138 230,123",
    "defaultFill": "#496982",
    "zone": "snout"
  },
  {
    "id": "segment_6_poly_53",
    "points": "154,258 155,286 141,284",
    "defaultFill": "#0c1631",
    "zone": "armLeft"
  },
  {
    "id": "segment_6_poly_54",
    "points": "155,286 154,258 180,282",
    "defaultFill": "#071532",
    "zone": "armLeft"
  },
  {
    "id": "segment_6_poly_55",
    "points": "174,296 155,286 180,282",
    "defaultFill": "#101b37",
    "zone": "torso"
  },
  {
    "id": "segment_2_poly_42",
    "points": "155,286 167,316 141,284",
    "defaultFill": "#000a25",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_56",
    "points": "154,258 180,261 180,282",
    "defaultFill": "#11213b",
    "zone": "armLeft"
  },
  {
    "id": "segment_2_poly_43",
    "points": "203,247 180,261 170,226",
    "defaultFill": "#051127",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_57",
    "points": "180,261 154,258 170,226",
    "defaultFill": "#0e1a34",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_58",
    "points": "207,313 176,312 208,305",
    "defaultFill": "#101c36",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_59",
    "points": "176,312 174,296 208,305",
    "defaultFill": "#09102c",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_60",
    "points": "176,312 207,313 188,331",
    "defaultFill": "#101a33",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_61",
    "points": "176,312 188,331 165,328",
    "defaultFill": "#0d1834",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_15",
    "points": "167,316 176,312 165,328",
    "defaultFill": "#7ca2c9",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_45",
    "points": "217,265 206,271 203,247",
    "defaultFill": "#122a4e",
    "zone": "armLeft"
  },
  {
    "id": "segment_6_poly_62",
    "points": "206,271 217,265 221,297",
    "defaultFill": "#121c37",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_63",
    "points": "200,277 206,271 221,297",
    "defaultFill": "#101733",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_64",
    "points": "232,292 231,300 221,297",
    "defaultFill": "#001433",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_65",
    "points": "231,300 232,292 239,307",
    "defaultFill": "#091e3d",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_66",
    "points": "231,300 222,311 221,297",
    "defaultFill": "#112041",
    "zone": "torso"
  },
  {
    "id": "segment_0_poly_41",
    "points": "222,311 231,300 228,317",
    "defaultFill": "#243e61",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_67",
    "points": "231,300 239,307 228,317",
    "defaultFill": "#061939",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_68",
    "points": "252,289 264,288 252,300",
    "defaultFill": "#0c1b3a",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_69",
    "points": "264,288 252,289 250,270",
    "defaultFill": "#081935",
    "zone": "armRight"
  },
  {
    "id": "segment_7_poly_16",
    "points": "240,287 252,289 252,300",
    "defaultFill": "#a3c4e7",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_70",
    "points": "239,307 240,287 252,300",
    "defaultFill": "#001c3f",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_71",
    "points": "232,292 240,287 239,307",
    "defaultFill": "#0c203b",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_42",
    "points": "262,268 264,288 250,270",
    "defaultFill": "#2b4a67",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_43",
    "points": "262,268 250,270 266,233",
    "defaultFill": "#1e456c",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_72",
    "points": "289,258 262,268 266,233",
    "defaultFill": "#0d1b35",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_73",
    "points": "283,288 289,258 302,284",
    "defaultFill": "#0b2242",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_74",
    "points": "264,288 283,288 267,296",
    "defaultFill": "#081736",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_44",
    "points": "283,288 262,268 289,258",
    "defaultFill": "#33516b",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_75",
    "points": "262,268 283,288 264,288",
    "defaultFill": "#081633",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_45",
    "points": "271,304 252,300 267,296",
    "defaultFill": "#274b6b",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_76",
    "points": "283,288 271,304 267,296",
    "defaultFill": "#0f1e3d",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_77",
    "points": "256,325 239,307 252,300",
    "defaultFill": "#0f1b33",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_46",
    "points": "271,304 256,325 252,300",
    "defaultFill": "#283d58",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_47",
    "points": "256,325 271,304 275,316",
    "defaultFill": "#2a4769",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_48",
    "points": "256,325 275,316 277,328",
    "defaultFill": "#2c4e71",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_78",
    "points": "239,307 256,325 228,317",
    "defaultFill": "#0e1833",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_79",
    "points": "228,317 256,325 221,367",
    "defaultFill": "#0f1932",
    "zone": "legs"
  },
  {
    "id": "segment_9_poly_46",
    "points": "221,367 256,325 285,361",
    "defaultFill": "#132644",
    "zone": "legs"
  },
  {
    "id": "segment_0_poly_49",
    "points": "256,325 277,328 285,361",
    "defaultFill": "#2f4665",
    "zone": "legs"
  },
  {
    "id": "segment_0_poly_50",
    "points": "297,259 311,239 305,259",
    "defaultFill": "#395271",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_51",
    "points": "311,239 297,259 289,258",
    "defaultFill": "#243956",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_52",
    "points": "302,284 297,259 305,259",
    "defaultFill": "#354e6c",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_53",
    "points": "289,258 297,259 302,284",
    "defaultFill": "#364d6c",
    "zone": "armRight"
  },
  {
    "id": "segment_3_poly_12",
    "points": "406,212 403,233 386,232",
    "defaultFill": "#694b43",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_14",
    "points": "417,211 406,212 410,198",
    "defaultFill": "#c38a5d",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_15",
    "points": "411,220 417,211 431,205",
    "defaultFill": "#a99481",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_16",
    "points": "403,233 411,220 431,205",
    "defaultFill": "#45312a",
    "zone": "tail"
  },
  {
    "id": "segment_3_poly_13",
    "points": "411,220 406,212 417,211",
    "defaultFill": "#785947",
    "zone": "tail"
  },
  {
    "id": "segment_3_poly_14",
    "points": "406,212 411,220 403,233",
    "defaultFill": "#674a3c",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_54",
    "points": "374,216 386,232 356,222",
    "defaultFill": "#415067",
    "zone": "tail"
  },
  {
    "id": "segment_4_poly_37",
    "points": "372,207 374,216 356,222",
    "defaultFill": "#3e5d7a",
    "zone": "tail"
  },
  {
    "id": "segment_3_poly_15",
    "points": "374,216 406,212 386,232",
    "defaultFill": "#816454",
    "zone": "tail"
  },
  {
    "id": "segment_7_poly_17",
    "points": "214,151 226,140 227,151",
    "defaultFill": "#769fbb",
    "zone": "snout"
  },
  {
    "id": "segment_6_poly_80",
    "points": "226,140 214,151 216,138",
    "defaultFill": "#06122a",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_47",
    "points": "205,177 214,151 227,151",
    "defaultFill": "#13253d",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_48",
    "points": "190,151 214,151 205,177",
    "defaultFill": "#162741",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_81",
    "points": "269,207 277,208 272,225",
    "defaultFill": "#031231",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_55",
    "points": "277,208 300,215 272,225",
    "defaultFill": "#334b67",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_82",
    "points": "277,208 297,207 300,215",
    "defaultFill": "#0e1e3f",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_56",
    "points": "277,208 294,186 297,207",
    "defaultFill": "#294664",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_57",
    "points": "294,186 277,208 284,174",
    "defaultFill": "#1a3c5f",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_58",
    "points": "277,208 269,207 284,174",
    "defaultFill": "#2c4764",
    "zone": "armRight"
  },
  {
    "id": "segment_9_poly_49",
    "points": "187,132 193,124 200,128",
    "defaultFill": "#1e3755",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_50",
    "points": "193,124 187,132 182,124",
    "defaultFill": "#1f3252",
    "zone": "snout"
  },
  {
    "id": "segment_6_poly_83",
    "points": "187,132 174,121 182,124",
    "defaultFill": "#001d3e",
    "zone": "head"
  },
  {
    "id": "segment_0_poly_59",
    "points": "187,132 190,151 179,164",
    "defaultFill": "#1c3c63",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_38",
    "points": "251,149 247,166 241,151",
    "defaultFill": "#365979",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_39",
    "points": "251,149 263,164 247,166",
    "defaultFill": "#47698c",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_40",
    "points": "251,149 254,133 263,164",
    "defaultFill": "#3b698b",
    "zone": "snout"
  },
  {
    "id": "segment_6_poly_84",
    "points": "251,149 241,151 237,140",
    "defaultFill": "#092241",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_51",
    "points": "254,133 251,149 237,140",
    "defaultFill": "#0f2145",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_41",
    "points": "298,157 316,131 310,156",
    "defaultFill": "#415671",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_60",
    "points": "292,178 298,157 310,156",
    "defaultFill": "#2e4362",
    "zone": "tail"
  },
  {
    "id": "segment_4_poly_42",
    "points": "235,115 239,128 230,123",
    "defaultFill": "#4d637b",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_43",
    "points": "239,128 254,133 237,140",
    "defaultFill": "#3c6082",
    "zone": "snout"
  },
  {
    "id": "segment_0_poly_61",
    "points": "254,133 239,128 244,112",
    "defaultFill": "#24486a",
    "zone": "snout"
  },
  {
    "id": "segment_3_poly_16",
    "points": "239,128 235,115 244,112",
    "defaultFill": "#676269",
    "zone": "eyes"
  },
  {
    "id": "segment_4_poly_44",
    "points": "226,140 239,128 237,140",
    "defaultFill": "#496c8c",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_45",
    "points": "239,128 226,140 230,123",
    "defaultFill": "#446785",
    "zone": "snout"
  },
  {
    "id": "segment_6_poly_86",
    "points": "155,286 171,304 167,316",
    "defaultFill": "#04122f",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_87",
    "points": "171,304 155,286 174,296",
    "defaultFill": "#0f1a36",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_18",
    "points": "171,304 176,312 167,316",
    "defaultFill": "#6785ab",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_19",
    "points": "176,312 171,304 174,296",
    "defaultFill": "#7da9d0",
    "zone": "torso"
  },
  {
    "id": "segment_6_poly_88",
    "points": "192,270 200,277 180,282",
    "defaultFill": "#000d2c",
    "zone": "armLeft"
  },
  {
    "id": "segment_0_poly_62",
    "points": "180,261 192,270 180,282",
    "defaultFill": "#2a3a5b",
    "zone": "armLeft"
  },
  {
    "id": "segment_9_poly_52",
    "points": "192,270 206,271 200,277",
    "defaultFill": "#202b49",
    "zone": "armLeft"
  },
  {
    "id": "segment_0_poly_63",
    "points": "252,289 239,275 250,270",
    "defaultFill": "#223c57",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_64",
    "points": "240,287 239,275 252,289",
    "defaultFill": "#2e4161",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_89",
    "points": "239,275 217,265 225,255",
    "defaultFill": "#0f1a30",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_90",
    "points": "250,270 239,275 225,255",
    "defaultFill": "#101a35",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_91",
    "points": "239,275 232,292 217,265",
    "defaultFill": "#131b32",
    "zone": "armRight"
  },
  {
    "id": "segment_0_poly_65",
    "points": "239,275 240,287 232,292",
    "defaultFill": "#2a3f5e",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_92",
    "points": "322,315 301,308 319,301",
    "defaultFill": "#0e1831",
    "zone": "tail"
  },
  {
    "id": "segment_10_poly_36",
    "points": "316,334 301,308 322,315",
    "defaultFill": "#06102b",
    "zone": "tail"
  },
  {
    "id": "segment_10_poly_37",
    "points": "275,316 301,308 277,328",
    "defaultFill": "#000924",
    "zone": "torso"
  },
  {
    "id": "segment_10_poly_38",
    "points": "301,308 316,334 277,328",
    "defaultFill": "#061127",
    "zone": "tail"
  },
  {
    "id": "segment_4_poly_46",
    "points": "386,200 374,216 372,207",
    "defaultFill": "#4e6879",
    "zone": "tail"
  },
  {
    "id": "segment_3_poly_17",
    "points": "374,216 386,200 406,212",
    "defaultFill": "#6b5f5f",
    "zone": "tail"
  },
  {
    "id": "segment_3_poly_18",
    "points": "406,212 386,200 410,198",
    "defaultFill": "#8c7567",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_53",
    "points": "216,138 205,139 200,128",
    "defaultFill": "#122546",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_54",
    "points": "214,151 205,139 216,138",
    "defaultFill": "#1b3452",
    "zone": "snout"
  },
  {
    "id": "segment_9_poly_55",
    "points": "205,139 214,151 190,151",
    "defaultFill": "#152944",
    "zone": "snout"
  },
  {
    "id": "segment_0_poly_66",
    "points": "205,139 187,132 200,128",
    "defaultFill": "#1f3c5e",
    "zone": "snout"
  },
  {
    "id": "segment_6_poly_93",
    "points": "187,132 205,139 190,151",
    "defaultFill": "#0c1a35",
    "zone": "snout"
  },
  {
    "id": "segment_6_poly_94",
    "points": "193,262 180,261 203,247",
    "defaultFill": "#06142f",
    "zone": "armLeft"
  },
  {
    "id": "segment_7_poly_20",
    "points": "193,262 192,270 180,261",
    "defaultFill": "#7797bd",
    "zone": "armLeft"
  },
  {
    "id": "segment_9_poly_56",
    "points": "206,271 193,262 203,247",
    "defaultFill": "#182c47",
    "zone": "armLeft"
  },
  {
    "id": "segment_9_poly_57",
    "points": "192,270 193,262 206,271",
    "defaultFill": "#142745",
    "zone": "armLeft"
  },
  {
    "id": "segment_9_poly_58",
    "points": "297,296 302,284 319,301",
    "defaultFill": "#1d324f",
    "zone": "armRight"
  },
  {
    "id": "segment_9_poly_59",
    "points": "301,308 297,296 319,301",
    "defaultFill": "#21354e",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_95",
    "points": "297,296 283,288 302,284",
    "defaultFill": "#0c182e",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_96",
    "points": "297,296 271,304 283,288",
    "defaultFill": "#0b1b34",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_97",
    "points": "271,304 297,296 275,316",
    "defaultFill": "#17203f",
    "zone": "armRight"
  },
  {
    "id": "segment_6_poly_98",
    "points": "297,296 301,308 275,316",
    "defaultFill": "#122138",
    "zone": "armRight"
  }
];
