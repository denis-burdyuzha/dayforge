export type FoxL3Zone = "ears" | "eyes" | "head" | "limbsBack" | "limbsFront" | "snout" | "tail" | "torso";

export interface FoxL3PolygonDef {
  id: string;
  points: string;
  defaultFill: string;
  /** Anatomical zone from foxL3_grouped.svg (`unassigned` = not classified) */
  zone: FoxL3Zone;
}

export const FOX_L3_POLYGONS: FoxL3PolygonDef[] = [
  {
    "id": "segment_3_poly_1",
    "points": "182,146 177,154 169,157",
    "defaultFill": "#7aaccd",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_1",
    "points": "177,154 181,162 169,157",
    "defaultFill": "#344f6d",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_1",
    "points": "210,180 293,162 222,201",
    "defaultFill": "#20314b",
    "zone": "torso"
  },
  {
    "id": "segment_2_poly_1",
    "points": "293,162 210,180 214,134",
    "defaultFill": "#293d56",
    "zone": "torso"
  },
  {
    "id": "segment_3_poly_2",
    "points": "214,134 205,141 182,146",
    "defaultFill": "#90d0ec",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_2",
    "points": "131,188 122,213 96,230",
    "defaultFill": "#35506e",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_2",
    "points": "122,213 116,256 96,230",
    "defaultFill": "#243757",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_3",
    "points": "116,256 122,213 137,246",
    "defaultFill": "#1a2b47",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_5",
    "points": "379,352 368,346 361,327",
    "defaultFill": "#0f1c2d",
    "zone": "limbsFront"
  },
  {
    "id": "segment_4_poly_1",
    "points": "291,139 293,162 214,134",
    "defaultFill": "#163351",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_1",
    "points": "205,141 188,154 182,146",
    "defaultFill": "#3e708b",
    "zone": "torso"
  },
  {
    "id": "segment_5_poly_2",
    "points": "188,154 177,154 182,146",
    "defaultFill": "#3e6d8b",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_3",
    "points": "177,154 188,154 181,162",
    "defaultFill": "#395374",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_4",
    "points": "303,268 324,257 321,313",
    "defaultFill": "#243a52",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_8",
    "points": "303,337 303,268 321,313",
    "defaultFill": "#0c162f",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_9",
    "points": "219,346 228,341 243,348",
    "defaultFill": "#0c1b3a",
    "zone": "limbsBack"
  },
  {
    "id": "segment_8_poly_5",
    "points": "133,344 146,302 153,309",
    "defaultFill": "#182842",
    "zone": "limbsBack"
  },
  {
    "id": "segment_8_poly_6",
    "points": "150,343 133,344 153,309",
    "defaultFill": "#152640",
    "zone": "limbsBack"
  },
  {
    "id": "segment_8_poly_7",
    "points": "42,311 55,298 51,309",
    "defaultFill": "#1b3252",
    "zone": "tail"
  },
  {
    "id": "segment_5_poly_3",
    "points": "8,293 36,260 16,296",
    "defaultFill": "#4d708e",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_4",
    "points": "164,166 131,188 169,157",
    "defaultFill": "#285373",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_5",
    "points": "164,166 160,174 131,188",
    "defaultFill": "#364f6e",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_6",
    "points": "181,162 164,166 169,157",
    "defaultFill": "#345171",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_7",
    "points": "160,174 164,166 181,162",
    "defaultFill": "#2e4c6e",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_8",
    "points": "158,185 160,174 181,162",
    "defaultFill": "#2a4b6a",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_10",
    "points": "345,327 353,311 361,327",
    "defaultFill": "#0f2137",
    "zone": "limbsFront"
  },
  {
    "id": "segment_8_poly_8",
    "points": "368,346 355,342 361,327",
    "defaultFill": "#1e3c58",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_13",
    "points": "355,342 345,327 361,327",
    "defaultFill": "#08142a",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_14",
    "points": "345,327 355,342 346,340",
    "defaultFill": "#061a3b",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_15",
    "points": "383,361 372,363 379,352",
    "defaultFill": "#092040",
    "zone": "limbsFront"
  },
  {
    "id": "segment_8_poly_9",
    "points": "372,363 368,346 379,352",
    "defaultFill": "#233b57",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_17",
    "points": "295,258 316,239 324,257",
    "defaultFill": "#08122d",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_18",
    "points": "303,268 295,258 324,257",
    "defaultFill": "#101c36",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_19",
    "points": "295,258 294,239 316,239",
    "defaultFill": "#0d1834",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_20",
    "points": "294,239 293,212 316,239",
    "defaultFill": "#0c1832",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_9",
    "points": "204,174 188,154 205,141",
    "defaultFill": "#243d5b",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_10",
    "points": "210,180 204,174 214,134",
    "defaultFill": "#2a3e59",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_11",
    "points": "204,174 205,141 214,134",
    "defaultFill": "#3e5b7b",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_10",
    "points": "188,154 204,174 181,162",
    "defaultFill": "#192943",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_11",
    "points": "204,174 158,185 181,162",
    "defaultFill": "#253652",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_12",
    "points": "243,336 228,341 233,334",
    "defaultFill": "#113452",
    "zone": "limbsBack"
  },
  {
    "id": "segment_8_poly_13",
    "points": "228,341 243,336 243,348",
    "defaultFill": "#283c5d",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_18",
    "points": "142,346 146,357 136,354",
    "defaultFill": "#080f29",
    "zone": "limbsBack"
  },
  {
    "id": "segment_8_poly_14",
    "points": "142,346 150,343 146,357",
    "defaultFill": "#1f3250",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_19",
    "points": "133,344 142,346 136,354",
    "defaultFill": "#020925",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_20",
    "points": "142,346 133,344 150,343",
    "defaultFill": "#020c27",
    "zone": "limbsBack"
  },
  {
    "id": "segment_8_poly_15",
    "points": "207,303 222,311 219,346",
    "defaultFill": "#2a3a53",
    "zone": "limbsBack"
  },
  {
    "id": "segment_8_poly_16",
    "points": "228,341 222,311 233,334",
    "defaultFill": "#183f5c",
    "zone": "limbsBack"
  },
  {
    "id": "segment_8_poly_17",
    "points": "222,311 228,341 219,346",
    "defaultFill": "#24334a",
    "zone": "limbsBack"
  },
  {
    "id": "segment_8_poly_18",
    "points": "207,249 192,268 186,257",
    "defaultFill": "#13273f",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_22",
    "points": "192,268 149,271 186,257",
    "defaultFill": "#04102a",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_23",
    "points": "161,356 150,343 153,309",
    "defaultFill": "#0e192b",
    "zone": "limbsBack"
  },
  {
    "id": "segment_8_poly_19",
    "points": "150,343 161,356 146,357",
    "defaultFill": "#14223d",
    "zone": "limbsBack"
  },
  {
    "id": "segment_11_poly_12",
    "points": "116,256 89,256 96,230",
    "defaultFill": "#253e5c",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_13",
    "points": "89,256 80,239 96,230",
    "defaultFill": "#354e6d",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_14",
    "points": "89,256 68,251 80,239",
    "defaultFill": "#2f4964",
    "zone": "tail"
  },
  {
    "id": "segment_5_poly_4",
    "points": "36,260 47,275 16,296",
    "defaultFill": "#4c6e8a",
    "zone": "tail"
  },
  {
    "id": "segment_5_poly_5",
    "points": "47,275 36,260 47,259",
    "defaultFill": "#547088",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_30",
    "points": "205,233 210,180 222,201",
    "defaultFill": "#0f1932",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_20",
    "points": "205,233 207,249 186,257",
    "defaultFill": "#1a2a44",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_31",
    "points": "207,249 205,233 219,226",
    "defaultFill": "#011b3c",
    "zone": "limbsBack"
  },
  {
    "id": "segment_8_poly_21",
    "points": "205,233 155,196 210,180",
    "defaultFill": "#24354f",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_22",
    "points": "155,196 204,174 210,180",
    "defaultFill": "#25374f",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_23",
    "points": "204,174 155,196 158,185",
    "defaultFill": "#172741",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_2",
    "points": "337,76 329,85 331,60",
    "defaultFill": "#001f48",
    "zone": "ears"
  },
  {
    "id": "segment_8_poly_24",
    "points": "335,361 339,370 326,372",
    "defaultFill": "#0f2242",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_32",
    "points": "355,342 355,359 346,340",
    "defaultFill": "#041839",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_1",
    "points": "379,182 394,190 390,202",
    "defaultFill": "#52748d",
    "zone": "torso"
  },
  {
    "id": "segment_0_poly_32",
    "points": "247,266 207,249 219,226",
    "defaultFill": "#07112a",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_33",
    "points": "207,249 247,266 210,264",
    "defaultFill": "#061127",
    "zone": "limbsBack"
  },
  {
    "id": "segment_4_poly_3",
    "points": "293,212 325,218 316,239",
    "defaultFill": "#192940",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_4",
    "points": "325,218 293,212 320,158",
    "defaultFill": "#1c2a44",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_5",
    "points": "320,158 287,206 293,162",
    "defaultFill": "#1c2c45",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_6",
    "points": "293,212 287,206 320,158",
    "defaultFill": "#1b2944",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_7",
    "points": "293,162 287,206 222,201",
    "defaultFill": "#20324a",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_8",
    "points": "325,105 329,85 331,95",
    "defaultFill": "#193c58",
    "zone": "head"
  },
  {
    "id": "segment_9_poly_37",
    "points": "303,346 320,357 312,367",
    "defaultFill": "#03132d",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_38",
    "points": "312,367 320,357 326,372",
    "defaultFill": "#07112a",
    "zone": "limbsFront"
  },
  {
    "id": "segment_8_poly_25",
    "points": "153,244 205,233 186,257",
    "defaultFill": "#1a2842",
    "zone": "limbsBack"
  },
  {
    "id": "segment_8_poly_26",
    "points": "153,244 155,196 205,233",
    "defaultFill": "#162640",
    "zone": "torso"
  },
  {
    "id": "segment_0_poly_35",
    "points": "122,213 153,244 137,246",
    "defaultFill": "#0c162f",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_36",
    "points": "155,196 153,244 122,213",
    "defaultFill": "#09152d",
    "zone": "tail"
  },
  {
    "id": "segment_9_poly_39",
    "points": "247,266 222,290 210,264",
    "defaultFill": "#0e1d30",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_38",
    "points": "194,294 222,290 207,303",
    "defaultFill": "#0b1933",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_40",
    "points": "222,290 194,294 210,264",
    "defaultFill": "#061029",
    "zone": "limbsBack"
  },
  {
    "id": "segment_11_poly_15",
    "points": "47,275 69,282 55,298",
    "defaultFill": "#2c405b",
    "zone": "tail"
  },
  {
    "id": "segment_5_poly_6",
    "points": "89,256 69,282 68,251",
    "defaultFill": "#4f6887",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_16",
    "points": "47,275 34,306 16,296",
    "defaultFill": "#28425d",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_27",
    "points": "34,306 55,298 42,311",
    "defaultFill": "#20314b",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_17",
    "points": "34,306 47,275 55,298",
    "defaultFill": "#2a3e59",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_18",
    "points": "145,188 122,213 131,188",
    "defaultFill": "#314663",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_28",
    "points": "145,188 155,196 122,213",
    "defaultFill": "#172740",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_29",
    "points": "155,196 145,188 158,185",
    "defaultFill": "#172542",
    "zone": "torso"
  },
  {
    "id": "segment_11_poly_19",
    "points": "160,174 145,188 131,188",
    "defaultFill": "#3d5674",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_30",
    "points": "158,185 145,188 160,174",
    "defaultFill": "#1b2644",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_9",
    "points": "369,65 364,75 331,60",
    "defaultFill": "#1a2c44",
    "zone": "ears"
  },
  {
    "id": "segment_6_poly_17",
    "points": "364,75 337,76 331,60",
    "defaultFill": "#0c1429",
    "zone": "ears"
  },
  {
    "id": "segment_7_poly_2",
    "points": "342,44 350,41 369,65",
    "defaultFill": "#607e98",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_10",
    "points": "342,44 334,51 341,33",
    "defaultFill": "#172f53",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_11",
    "points": "350,41 342,44 341,33",
    "defaultFill": "#0e2843",
    "zone": "ears"
  },
  {
    "id": "segment_7_poly_3",
    "points": "414,40 421,55 407,49",
    "defaultFill": "#466987",
    "zone": "ears"
  },
  {
    "id": "segment_7_poly_4",
    "points": "421,55 414,40 423,35",
    "defaultFill": "#496d8f",
    "zone": "ears"
  },
  {
    "id": "segment_7_poly_5",
    "points": "399,52 414,40 407,49",
    "defaultFill": "#445f7d",
    "zone": "ears"
  },
  {
    "id": "segment_7_poly_6",
    "points": "316,239 332,255 324,257",
    "defaultFill": "#516485",
    "zone": "limbsFront"
  },
  {
    "id": "segment_2_poly_2",
    "points": "379,182 375,215 349,202",
    "defaultFill": "#354d67",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_7",
    "points": "375,215 379,182 390,202",
    "defaultFill": "#50738f",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_31",
    "points": "353,311 365,252 361,327",
    "defaultFill": "#103255",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_42",
    "points": "365,252 372,243 361,327",
    "defaultFill": "#0f172a",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_43",
    "points": "332,255 365,252 353,311",
    "defaultFill": "#0b132a",
    "zone": "limbsFront"
  },
  {
    "id": "segment_2_poly_3",
    "points": "372,363 361,351 368,346",
    "defaultFill": "#364d6d",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_44",
    "points": "355,359 361,351 372,363",
    "defaultFill": "#0e1831",
    "zone": "limbsFront"
  },
  {
    "id": "segment_8_poly_32",
    "points": "361,351 355,342 368,346",
    "defaultFill": "#253859",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_45",
    "points": "361,351 355,359 355,342",
    "defaultFill": "#142038",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_8",
    "points": "398,181 394,190 379,182",
    "defaultFill": "#4d718b",
    "zone": "torso"
  },
  {
    "id": "segment_2_poly_4",
    "points": "346,192 379,182 349,202",
    "defaultFill": "#334b65",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_12",
    "points": "341,161 346,192 320,158",
    "defaultFill": "#13233c",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_46",
    "points": "325,218 346,192 349,202",
    "defaultFill": "#0c1832",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_13",
    "points": "346,192 325,218 320,158",
    "defaultFill": "#101b37",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_15",
    "points": "381,141 369,170 353,143",
    "defaultFill": "#182945",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_16",
    "points": "369,170 341,161 353,143",
    "defaultFill": "#243551",
    "zone": "snout"
  },
  {
    "id": "segment_2_poly_5",
    "points": "346,192 369,170 379,182",
    "defaultFill": "#344c68",
    "zone": "torso"
  },
  {
    "id": "segment_2_poly_6",
    "points": "369,170 346,192 341,161",
    "defaultFill": "#2c4460",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_33",
    "points": "290,249 294,239 295,258",
    "defaultFill": "#10315a",
    "zone": "torso"
  },
  {
    "id": "segment_8_poly_34",
    "points": "287,206 258,243 222,201",
    "defaultFill": "#13213b",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_48",
    "points": "258,243 247,266 219,226",
    "defaultFill": "#07122e",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_49",
    "points": "290,249 258,243 294,239",
    "defaultFill": "#101e38",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_51",
    "points": "258,243 293,212 294,239",
    "defaultFill": "#0f1630",
    "zone": "torso"
  },
  {
    "id": "segment_9_poly_52",
    "points": "258,243 287,206 293,212",
    "defaultFill": "#0e1330",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_17",
    "points": "341,161 331,124 353,143",
    "defaultFill": "#131a34",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_18",
    "points": "331,124 341,161 320,158",
    "defaultFill": "#131e34",
    "zone": "snout"
  },
  {
    "id": "segment_8_poly_35",
    "points": "328,355 335,361 326,372",
    "defaultFill": "#15253f",
    "zone": "limbsFront"
  },
  {
    "id": "segment_8_poly_36",
    "points": "320,357 328,355 326,372",
    "defaultFill": "#1a2d4e",
    "zone": "limbsFront"
  },
  {
    "id": "segment_8_poly_37",
    "points": "327,346 320,357 303,346",
    "defaultFill": "#182641",
    "zone": "limbsFront"
  },
  {
    "id": "segment_8_poly_38",
    "points": "327,346 328,355 320,357",
    "defaultFill": "#132d4e",
    "zone": "limbsFront"
  },
  {
    "id": "segment_0_poly_43",
    "points": "142,261 116,256 137,246",
    "defaultFill": "#081329",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_44",
    "points": "142,261 122,284 116,256",
    "defaultFill": "#08122b",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_45",
    "points": "136,288 142,261 149,271",
    "defaultFill": "#0d1426",
    "zone": "limbsBack"
  },
  {
    "id": "segment_8_poly_40",
    "points": "217,300 222,311 207,303",
    "defaultFill": "#1f3856",
    "zone": "limbsBack"
  },
  {
    "id": "segment_11_poly_21",
    "points": "222,290 217,300 207,303",
    "defaultFill": "#2a4968",
    "zone": "limbsBack"
  },
  {
    "id": "segment_9_poly_55",
    "points": "217,300 222,290 222,311",
    "defaultFill": "#0a192e",
    "zone": "limbsBack"
  },
  {
    "id": "segment_8_poly_41",
    "points": "146,302 160,296 153,309",
    "defaultFill": "#072847",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_47",
    "points": "192,268 160,296 149,271",
    "defaultFill": "#05152f",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_49",
    "points": "136,288 160,296 146,302",
    "defaultFill": "#071329",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_50",
    "points": "160,296 136,288 149,271",
    "defaultFill": "#071224",
    "zone": "limbsBack"
  },
  {
    "id": "segment_8_poly_42",
    "points": "102,284 89,256 116,256",
    "defaultFill": "#1b273d",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_51",
    "points": "102,284 122,284 115,291",
    "defaultFill": "#0c1830",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_52",
    "points": "122,284 102,284 116,256",
    "defaultFill": "#0c1326",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_53",
    "points": "65,304 69,282 80,309",
    "defaultFill": "#0a1229",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_54",
    "points": "69,282 65,304 55,298",
    "defaultFill": "#04102a",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_43",
    "points": "65,304 80,309 51,309",
    "defaultFill": "#0d2144",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_44",
    "points": "55,298 65,304 51,309",
    "defaultFill": "#19304f",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_22",
    "points": "68,251 56,260 47,259",
    "defaultFill": "#225980",
    "zone": "tail"
  },
  {
    "id": "segment_11_poly_23",
    "points": "69,282 56,260 68,251",
    "defaultFill": "#304967",
    "zone": "tail"
  },
  {
    "id": "segment_5_poly_7",
    "points": "56,260 47,275 47,259",
    "defaultFill": "#547390",
    "zone": "tail"
  },
  {
    "id": "segment_8_poly_45",
    "points": "56,260 69,282 47,275",
    "defaultFill": "#112442",
    "zone": "tail"
  },
  {
    "id": "segment_2_poly_7",
    "points": "349,86 364,75 362,97",
    "defaultFill": "#3d536b",
    "zone": "head"
  },
  {
    "id": "segment_6_poly_26",
    "points": "364,75 349,86 337,76",
    "defaultFill": "#081329",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_19",
    "points": "329,85 349,86 331,95",
    "defaultFill": "#20314f",
    "zone": "head"
  },
  {
    "id": "segment_2_poly_8",
    "points": "337,76 349,86 329,85",
    "defaultFill": "#233a5a",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_9",
    "points": "421,55 412,57 407,49",
    "defaultFill": "#516f8b",
    "zone": "ears"
  },
  {
    "id": "segment_2_poly_9",
    "points": "412,57 421,55 421,65",
    "defaultFill": "#243d5b",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_20",
    "points": "412,57 399,52 407,49",
    "defaultFill": "#001b41",
    "zone": "ears"
  },
  {
    "id": "segment_2_poly_10",
    "points": "412,57 398,67 399,52",
    "defaultFill": "#214261",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_21",
    "points": "348,243 365,252 332,255",
    "defaultFill": "#18233f",
    "zone": "limbsFront"
  },
  {
    "id": "segment_2_poly_11",
    "points": "325,218 348,243 316,239",
    "defaultFill": "#2a3f5a",
    "zone": "torso"
  },
  {
    "id": "segment_2_poly_12",
    "points": "348,243 332,255 316,239",
    "defaultFill": "#3a4f6a",
    "zone": "limbsFront"
  },
  {
    "id": "segment_2_poly_13",
    "points": "348,243 325,218 349,202",
    "defaultFill": "#2b435d",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_22",
    "points": "407,148 400,143 416,138",
    "defaultFill": "#1e324a",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_23",
    "points": "386,159 381,141 392,141",
    "defaultFill": "#172b46",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_24",
    "points": "386,159 369,170 381,141",
    "defaultFill": "#192a46",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_25",
    "points": "400,143 386,159 392,141",
    "defaultFill": "#1a3151",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_26",
    "points": "369,170 386,159 379,182",
    "defaultFill": "#20314d",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_10",
    "points": "386,159 407,148 403,173",
    "defaultFill": "#42668a",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_27",
    "points": "386,159 400,143 407,148",
    "defaultFill": "#1e3756",
    "zone": "snout"
  },
  {
    "id": "segment_7_poly_11",
    "points": "398,181 386,159 403,173",
    "defaultFill": "#4b6f8f",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_12",
    "points": "386,159 398,181 379,182",
    "defaultFill": "#3e5f7e",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_28",
    "points": "376,134 381,141 353,143",
    "defaultFill": "#1d3454",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_29",
    "points": "362,129 376,134 353,143",
    "defaultFill": "#1c314e",
    "zone": "snout"
  },
  {
    "id": "segment_7_poly_13",
    "points": "407,95 385,96 391,82",
    "defaultFill": "#54606e",
    "zone": "eyes"
  },
  {
    "id": "segment_11_poly_24",
    "points": "258,243 221,218 222,201",
    "defaultFill": "#2c3d59",
    "zone": "torso"
  },
  {
    "id": "segment_0_poly_55",
    "points": "221,218 258,243 219,226",
    "defaultFill": "#001132",
    "zone": "torso"
  },
  {
    "id": "segment_0_poly_56",
    "points": "221,218 205,233 222,201",
    "defaultFill": "#081631",
    "zone": "torso"
  },
  {
    "id": "segment_0_poly_57",
    "points": "205,233 221,218 219,226",
    "defaultFill": "#001134",
    "zone": "torso"
  },
  {
    "id": "segment_2_poly_14",
    "points": "349,86 355,107 331,95",
    "defaultFill": "#334762",
    "zone": "head"
  },
  {
    "id": "segment_2_poly_15",
    "points": "355,107 349,86 362,97",
    "defaultFill": "#374f69",
    "zone": "head"
  },
  {
    "id": "segment_2_poly_16",
    "points": "352,115 362,129 353,143",
    "defaultFill": "#2d4a6c",
    "zone": "snout"
  },
  {
    "id": "segment_7_poly_14",
    "points": "331,124 352,115 353,143",
    "defaultFill": "#5b789a",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_30",
    "points": "352,115 331,124 325,105",
    "defaultFill": "#172d45",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_31",
    "points": "352,115 325,105 331,95",
    "defaultFill": "#091e39",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_32",
    "points": "355,107 352,115 331,95",
    "defaultFill": "#172339",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_33",
    "points": "306,139 320,158 293,162",
    "defaultFill": "#17253f",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_34",
    "points": "291,139 306,139 293,162",
    "defaultFill": "#20344f",
    "zone": "torso"
  },
  {
    "id": "segment_3_poly_3",
    "points": "299,135 306,139 291,139",
    "defaultFill": "#95c7ea",
    "zone": "torso"
  },
  {
    "id": "segment_2_poly_17",
    "points": "331,124 322,119 325,105",
    "defaultFill": "#284563",
    "zone": "head"
  },
  {
    "id": "segment_8_poly_46",
    "points": "323,333 303,337 321,313",
    "defaultFill": "#16263f",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_59",
    "points": "323,333 303,346 303,337",
    "defaultFill": "#09152f",
    "zone": "limbsFront"
  },
  {
    "id": "segment_8_poly_47",
    "points": "323,333 327,346 303,346",
    "defaultFill": "#172740",
    "zone": "limbsFront"
  },
  {
    "id": "segment_0_poly_58",
    "points": "142,261 152,253 149,271",
    "defaultFill": "#001027",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_59",
    "points": "149,271 152,253 186,257",
    "defaultFill": "#0f1b33",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_60",
    "points": "152,253 153,244 186,257",
    "defaultFill": "#111d35",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_61",
    "points": "153,244 152,253 137,246",
    "defaultFill": "#08132f",
    "zone": "limbsBack"
  },
  {
    "id": "segment_0_poly_62",
    "points": "152,253 142,261 137,246",
    "defaultFill": "#061125",
    "zone": "limbsBack"
  },
  {
    "id": "segment_8_poly_48",
    "points": "94,289 69,282 89,256",
    "defaultFill": "#192943",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_63",
    "points": "102,284 94,289 89,256",
    "defaultFill": "#0b162c",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_64",
    "points": "69,282 94,289 80,309",
    "defaultFill": "#081329",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_65",
    "points": "80,309 94,289 115,291",
    "defaultFill": "#0d1834",
    "zone": "tail"
  },
  {
    "id": "segment_0_poly_66",
    "points": "94,289 102,284 115,291",
    "defaultFill": "#091734",
    "zone": "tail"
  },
  {
    "id": "segment_7_poly_15",
    "points": "380,65 364,75 369,65",
    "defaultFill": "#3b5f81",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_16",
    "points": "380,65 388,71 364,75",
    "defaultFill": "#476682",
    "zone": "head"
  },
  {
    "id": "segment_3_poly_4",
    "points": "384,213 375,215 390,202",
    "defaultFill": "#92c8ee",
    "zone": "torso"
  },
  {
    "id": "segment_2_poly_18",
    "points": "385,224 384,213 390,202",
    "defaultFill": "#205277",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_17",
    "points": "384,213 385,224 375,215",
    "defaultFill": "#3f658c",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_35",
    "points": "365,252 364,243 372,243",
    "defaultFill": "#092b47",
    "zone": "limbsFront"
  },
  {
    "id": "segment_9_poly_60",
    "points": "348,243 364,243 365,252",
    "defaultFill": "#000f26",
    "zone": "limbsFront"
  },
  {
    "id": "segment_2_poly_19",
    "points": "375,215 368,225 349,202",
    "defaultFill": "#395270",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_36",
    "points": "368,225 348,243 349,202",
    "defaultFill": "#263850",
    "zone": "torso"
  },
  {
    "id": "segment_4_poly_37",
    "points": "368,225 364,243 348,243",
    "defaultFill": "#173154",
    "zone": "limbsFront"
  },
  {
    "id": "segment_7_poly_18",
    "points": "364,243 368,225 372,243",
    "defaultFill": "#425d78",
    "zone": "limbsFront"
  },
  {
    "id": "segment_2_poly_20",
    "points": "368,225 385,224 372,243",
    "defaultFill": "#385c7c",
    "zone": "torso"
  },
  {
    "id": "segment_2_poly_21",
    "points": "385,224 368,225 375,215",
    "defaultFill": "#295578",
    "zone": "torso"
  },
  {
    "id": "segment_2_poly_22",
    "points": "413,80 403,77 421,65",
    "defaultFill": "#2b405b",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_38",
    "points": "403,77 412,57 421,65",
    "defaultFill": "#1e3853",
    "zone": "ears"
  },
  {
    "id": "segment_7_poly_19",
    "points": "412,57 403,77 398,67",
    "defaultFill": "#4b6a86",
    "zone": "ears"
  },
  {
    "id": "segment_7_poly_20",
    "points": "388,71 403,77 391,82",
    "defaultFill": "#56768d",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_21",
    "points": "403,77 388,71 398,67",
    "defaultFill": "#3b5e7e",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_22",
    "points": "403,77 407,95 391,82",
    "defaultFill": "#5b6f87",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_23",
    "points": "403,77 413,80 407,95",
    "defaultFill": "#52718e",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_24",
    "points": "418,91 413,80 421,65",
    "defaultFill": "#416386",
    "zone": "ears"
  },
  {
    "id": "segment_3_poly_5",
    "points": "418,91 424,121 419,109",
    "defaultFill": "#aebbcb",
    "zone": "snout"
  },
  {
    "id": "segment_10_poly_1",
    "points": "411,102 418,91 419,109",
    "defaultFill": "#4f5257",
    "zone": "eyes"
  },
  {
    "id": "segment_2_poly_23",
    "points": "407,95 418,91 411,102",
    "defaultFill": "#464958",
    "zone": "eyes"
  },
  {
    "id": "segment_7_poly_25",
    "points": "413,80 418,91 407,95",
    "defaultFill": "#587b97",
    "zone": "head"
  },
  {
    "id": "segment_10_poly_2",
    "points": "385,96 389,113 381,106",
    "defaultFill": "#55403d",
    "zone": "eyes"
  },
  {
    "id": "segment_7_poly_26",
    "points": "389,113 385,96 407,95",
    "defaultFill": "#60646d",
    "zone": "eyes"
  },
  {
    "id": "segment_4_poly_39",
    "points": "408,129 421,129 416,138",
    "defaultFill": "#3a2426",
    "zone": "snout"
  },
  {
    "id": "segment_2_poly_24",
    "points": "400,143 408,129 416,138",
    "defaultFill": "#394f67",
    "zone": "snout"
  },
  {
    "id": "segment_2_poly_25",
    "points": "380,122 376,134 362,129",
    "defaultFill": "#384d68",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_1",
    "points": "380,122 371,104 381,106",
    "defaultFill": "#97715a",
    "zone": "eyes"
  },
  {
    "id": "segment_10_poly_3",
    "points": "389,113 380,122 381,106",
    "defaultFill": "#5f5053",
    "zone": "eyes"
  },
  {
    "id": "segment_10_poly_4",
    "points": "371,104 378,91 381,106",
    "defaultFill": "#66483e",
    "zone": "eyes"
  },
  {
    "id": "segment_10_poly_5",
    "points": "378,91 385,96 381,106",
    "defaultFill": "#41363c",
    "zone": "eyes"
  },
  {
    "id": "segment_4_poly_40",
    "points": "378,91 371,104 362,97",
    "defaultFill": "#303241",
    "zone": "eyes"
  },
  {
    "id": "segment_2_poly_26",
    "points": "364,75 378,91 362,97",
    "defaultFill": "#445162",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_27",
    "points": "385,96 378,91 391,82",
    "defaultFill": "#4c6174",
    "zone": "eyes"
  },
  {
    "id": "segment_7_poly_28",
    "points": "378,91 388,71 391,82",
    "defaultFill": "#4b667b",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_29",
    "points": "388,71 378,91 364,75",
    "defaultFill": "#46647c",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_41",
    "points": "363,108 352,115 355,107",
    "defaultFill": "#162137",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_42",
    "points": "371,104 363,108 362,97",
    "defaultFill": "#37313b",
    "zone": "eyes"
  },
  {
    "id": "segment_4_poly_43",
    "points": "363,108 355,107 362,97",
    "defaultFill": "#1c273d",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_30",
    "points": "352,115 363,108 362,129",
    "defaultFill": "#7186a3",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_44",
    "points": "363,108 380,122 362,129",
    "defaultFill": "#101e38",
    "zone": "snout"
  },
  {
    "id": "segment_10_poly_6",
    "points": "380,122 363,108 371,104",
    "defaultFill": "#5e515a",
    "zone": "eyes"
  },
  {
    "id": "segment_3_poly_6",
    "points": "315,133 306,139 299,135",
    "defaultFill": "#80b2d3",
    "zone": "torso"
  },
  {
    "id": "segment_2_poly_27",
    "points": "315,133 322,119 331,124",
    "defaultFill": "#254461",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_46",
    "points": "315,133 331,124 320,158",
    "defaultFill": "#1d2e4c",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_47",
    "points": "306,139 315,133 320,158",
    "defaultFill": "#16203b",
    "zone": "torso"
  },
  {
    "id": "segment_7_poly_31",
    "points": "388,71 390,63 398,67",
    "defaultFill": "#3d627f",
    "zone": "head"
  },
  {
    "id": "segment_7_poly_32",
    "points": "380,65 390,63 388,71",
    "defaultFill": "#426988",
    "zone": "head"
  },
  {
    "id": "segment_4_poly_48",
    "points": "398,67 390,63 399,52",
    "defaultFill": "#0c2440",
    "zone": "ears"
  },
  {
    "id": "segment_2_poly_28",
    "points": "391,130 400,143 392,141",
    "defaultFill": "#2a3f5c",
    "zone": "snout"
  },
  {
    "id": "segment_2_poly_29",
    "points": "391,130 408,129 400,143",
    "defaultFill": "#32495b",
    "zone": "snout"
  },
  {
    "id": "segment_4_poly_49",
    "points": "391,130 380,122 389,113",
    "defaultFill": "#2f3447",
    "zone": "eyes"
  },
  {
    "id": "segment_2_poly_30",
    "points": "380,122 391,130 376,134",
    "defaultFill": "#3a526a",
    "zone": "snout"
  },
  {
    "id": "segment_7_poly_33",
    "points": "381,141 391,130 392,141",
    "defaultFill": "#647893",
    "zone": "snout"
  },
  {
    "id": "segment_7_poly_34",
    "points": "376,134 391,130 381,141",
    "defaultFill": "#4e637e",
    "zone": "snout"
  },
  {
    "id": "segment_10_poly_7",
    "points": "405,112 411,102 419,109",
    "defaultFill": "#63461e",
    "zone": "eyes"
  },
  {
    "id": "segment_10_poly_8",
    "points": "405,112 407,95 411,102",
    "defaultFill": "#6a503f",
    "zone": "eyes"
  },
  {
    "id": "segment_1_poly_2",
    "points": "405,112 389,113 407,95",
    "defaultFill": "#727375",
    "zone": "eyes"
  },
  {
    "id": "segment_4_poly_50",
    "points": "405,112 391,130 389,113",
    "defaultFill": "#263145",
    "zone": "eyes"
  },
  {
    "id": "segment_4_poly_51",
    "points": "391,130 405,112 408,129",
    "defaultFill": "#262d37",
    "zone": "snout"
  },
  {
    "id": "segment_3_poly_7",
    "points": "421,129 415,123 424,121",
    "defaultFill": "#96a4af",
    "zone": "snout"
  },
  {
    "id": "segment_10_poly_9",
    "points": "408,129 415,123 421,129",
    "defaultFill": "#5a2a02",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_3",
    "points": "405,112 415,123 408,129",
    "defaultFill": "#bd8b66",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_4",
    "points": "424,121 415,123 419,109",
    "defaultFill": "#727584",
    "zone": "snout"
  },
  {
    "id": "segment_1_poly_5",
    "points": "415,123 405,112 419,109",
    "defaultFill": "#73726e",
    "zone": "eyes"
  },
  {
    "id": "segment_4_poly_52",
    "points": "342,44 369,65 331,60",
    "defaultFill": "#1e3048",
    "zone": "ears"
  },
  {
    "id": "segment_4_poly_53",
    "points": "334,51 342,44 331,60",
    "defaultFill": "#03254b",
    "zone": "ears"
  }
];
