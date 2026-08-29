# Dragon Flight third-party assets

Downloaded and verified on 2026-08-29. Runtime files are stored locally; the game must not hotlink the source URLs below.

All three models were created by **Quaternius** and are dedicated to the public domain under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/). The publisher-supplied license text is preserved in [`LICENSE-Quaternius.txt`](./LICENSE-Quaternius.txt).

## Dragon

- Runtime file: `models/dragon.glb`
- Source page: <https://poly.pizza/m/VBvzjFIYws>
- Direct source file: <https://static.poly.pizza/9714f533-5d2d-4cfd-b8f1-c8dfff64a672.glb>
- Poly Pizza resource ID: `9714f533-5d2d-4cfd-b8f1-c8dfff64a672`
- Source metadata: `Licence: CC0 1.0`, animated, FBX/glTF
- File size: 268,896 bytes
- SHA-256: `983f28d4864199f45e1ca67005466d35f2381f08ecf2e234735bf65ecd7be252`
- Parsed runtime geometry: 1,344 triangles across 6 primitives; 2,970 POSITION accessor entries; 2 meshes; 6 materials
- Animations (5): attack, alternate attack, death, flying, hit
- Generator recorded in the GLB: `FBX2glTF v0.9.7`

Poly Pizza's page metadata reports 1,088 triangles. The 1,344 figure above is the count obtained from the downloaded GLB's actual indexed render primitives, so it is the conservative runtime figure.

## Deer and fox

- Official pack page: <https://quaternius.com/packs/ultimateanimatedanimals.html>
- Official publisher folder: <https://drive.google.com/drive/folders/1uJ3N5HfB7jKTseJUNQr3N4YaN0UuEtHk?usp=sharing>
- Pack description: 12 animated animals, each with more than 12 animations; FBX, OBJ, glTF, and Blend; CC0
- Original deer file: <https://drive.google.com/file/d/1iGpXKrqYGyZCPGHPPSuDAoKnOXLhXJ0q/view>
- Original fox file: <https://drive.google.com/file/d/1z-CWoUC2vJxrqgGFTYlMaywpE1ooV-bA/view>

The publisher files were self-contained JSON glTF files with base64-embedded buffers. They were losslessly repacked as GLB for smaller transfer size and simpler browser loading; meshes, materials, rigs, and animation data were not altered.

### Deer

- Runtime file: `models/deer.glb`
- File size: 2,013,616 bytes
- SHA-256: `dc800250576fc8140f4129f13bb674ff44172437f2fb5170cc9be331d28efc3c`
- Parsed runtime geometry: 2,098 triangles across 7 primitives; 4,278 POSITION accessor entries; 1 mesh; 7 materials
- Animations: 13, including idle, walk, gallop, jump, eating, attacks, hit reactions, and death

### Fox

- Runtime file: `models/fox.glb`
- File size: 1,909,888 bytes
- SHA-256: `6e2a80bb80a6ca53886d327b77583ce06e455a6f24ae021d43d1f04a6fde99f9`
- Parsed runtime geometry: 1,848 triangles across 5 primitives; 3,752 POSITION accessor entries; 1 mesh; 5 materials
- Animations: 12, including idle, walk, gallop, jump, eating, attack, hit reactions, and death

The deer and fox total 3,923,504 bytes (about 3.74 MiB) after repacking.

## Publisher license file

- Runtime copy: `LICENSE-Quaternius.txt`
- Original publisher file: <https://drive.google.com/file/d/1F2uy8T2fRpdc6gZ4mnS02_C2E63WvKtn/view>
- SHA-256: `83d8959f9fc56353ed571fbe2dc52e4bcd64508e2399501cd45ac2ce3df0bf8c`

## Kenney Nature Kit environment models

Six static environment meshes were selected from **Kenney Nature Kit 2.1**, created and distributed by Kenney. The official asset page identifies the pack as 330 3D nature files under [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/). The publisher-supplied license text is preserved in [`LICENSE-Kenney.txt`](./LICENSE-Kenney.txt).

- Official pack page: <https://kenney.nl/assets/nature-kit>
- Official source archive: <https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip>
- Source archive size: 10,537,521 bytes
- Source archive SHA-256: `fa7974a0d342bfe63c38664ba9f8ec1a4aab8ea25f099bdc56870e33588c4d9d`
- Publisher license SHA-256: `cb96b75e3560ac78d7a53ce6f083f4cdb5c53faea6141b62d63458dcfe1e4b9d`

The runtime files below are unmodified, self-contained GLB v2 models extracted from the archive's `Models/GLTF format/` directory and renamed for stable game-facing paths. They use solid-colour PBR materials only: no images, textures, animations, or external URIs.

| Runtime file | Original archive file | Bytes | Triangles | Primitives | SHA-256 |
| --- | --- | ---: | ---: | ---: | --- |
| `environment/tree-deciduous.glb` | `tree_detailed.glb` | 31,412 | 402 | 3 | `c041daf2f0fb1d49e4325227cbcd58667adbe51e9b55e8c1f0a94b74cc521b3b` |
| `environment/tree-pine.glb` | `tree_pineTallA_detailed.glb` | 10,708 | 134 | 2 | `9ba6337460e718b8baf165b23c02f39455e3d5757b1911505410c46bc88a86b5` |
| `environment/bush.glb` | `plant_bushDetailed.glb` | 10,172 | 104 | 1 | `2e0487020d68ccf664435db9d829c78ae00e6d2785ee3ec10b9f89cc70a10406` |
| `environment/grass.glb` | `grass_leafsLarge.glb` | 13,988 | 144 | 1 | `a68b9b3d9639afaeb4ace840d5a8e3f21ffc4e8afc1eab15566500fbb2bee3e3` |
| `environment/rock.glb` | `rock_largeC.glb` | 7,004 | 72 | 2 | `23aee8b727adeaf260207af3e0615dc69aa766c6d87de1d44cbc8c2711d74dd1` |
| `environment/log.glb` | `log_large.glb` | 7,924 | 96 | 2 | `e7a92369062d491e5a31a163d390e07db04ee573605bbfa84c00660d18896b4c` |

Combined runtime payload: **81,208 bytes** (about 79.3 KiB), 952 triangles across 11 primitives.
