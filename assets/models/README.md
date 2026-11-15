# assets/models

Put your exported model here as **`jesus_mary.glb`** (one file holding both figures).
Until that file exists, the niche shows stand-in figures built in code
(`js/niche/placeholder-figures.js`), so the site never looks broken.

## Names the site looks for (use `_L` / `_R`, never dots)

| What | Christ | Our Lady |
|---|---|---|
| Armature (root) | `Jesus` or `Jesus_Rig` | `Mary` or `Mary_Rig` |
| Spine bone (breathing) | `Jesus_Spine` | `Mary_Spine` |
| Neck bone (cursor follow) | `Jesus_Neck` | `Mary_Neck` |
| Head bone (cursor follow) | `Jesus_Head` | `Mary_Head` |
| Hand bone(s) (light motes) | `Jesus_Hand_R` | `Mary_Hand_R`, `Mary_Hand_L` |
| Halo anchor (optional Empty, child of the head bone) | `Jesus_Halo` | `Mary_Halo` |
| Meshes (prefix) | `Jesus_…` | `Mary_…` |

## Animation clips (NLA track names)

| Clip | Plays | Notes |
|---|---|---|
| `Jesus_Idle`, `Mary_Idle` | loop | Breathing on the spine only; don't key head or neck. |
| `Jesus_Bless`, `Mary_Bless` | once, on click | Start and end in the rest pose. |

## Export checklist

- Figures face the front view (−Y in Blender), feet at z = 0, transforms applied.
- glTF Binary (.glb), +Y Up, Skinning on, Animation mode "NLA Tracks", Draco off.
- Keep it under about 5 MB.
- The browser console lists the clip names it found.
