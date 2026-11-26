# 감자 게임 — 에셋 생성 프롬프트

각 블록은 **그대로 복사해서 붙이면 되는 완성 프롬프트**다. 조립할 것 없다.

## 먼저 읽을 것

> **기준 이미지는 이미 나왔다.** `art/raw/04-1-hero-front.png`. 앞으로 모든 블록에 이 파일을 첨부한다.
> 아래 프롬프트의 색값은 그 그림에서 직접 뽑아낸 실제 값으로 바꿔 놨다. `src/tokens.ts`와 같은 숫자다.

**1. 주인공 정면(4-1)을 제일 먼저 뽑는다.** 마음에 들 때까지 반복한다. 그게 기준 이미지다.

**2. 4-1 말고 나머지는 전부 기준 이미지를 첨부해서 뽑는다.** 레퍼런스를 참고하라는 문장은 이미 모든 블록 끝에 들어가 있으니, 이미지만 같이 올리면 된다.

텍스트만으로는 10장쯤 가면 반드시 톤이 갈라진다. 레퍼런스 첨부가 유일한 방법이다.

**3. 배경은 마젠타로 받는다.** 모든 프롬프트에 이미 들어가 있다. 투명 배경은 요청해도 자주 무시되고, 흰 배경은 크림색 에셋과 섞여서 키잉이 안 된다.

**4. 한 번에 하나씩.** 여러 개를 한 장에 넣으면 크기가 제각각이 된다. 스프라이트 시트만 예외.

**5. 해상도** — 타일·아이템·도구는 512×512(사용은 128px), 캐릭터는 512×512(사용은 256px), 배경은 2048×512.

### 뽑는 순서

주인공 정면 → 밭 타일 → 감자 → 부엌 도구 → 요리 → 손님 → 주인공 걷기 → UI → 이펙트

---

# 4. 캐릭터

## 4-1. 주인공 정면 — 기준 이미지

```
A young potato farmer-cook character standing facing the viewer, friendly and simple. Wears a dusty blue apron over a terracotta shirt, brown boots, short brown hair. Simple dot eyes and a small smile. Cute but not childish. Arms relaxed at the sides. Full body, orthographic, standing on flat ground, no perspective distortion, feet at the bottom of the frame.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel like a relaxing cafe management game. Simple and readable at small size. Solid flat magenta background, exact color #FF00FF, no shadow.
```

## 4-2. 주인공 4방향 걷기 시트

```
A 4x4 sprite sheet grid on a single image, 4 rows and 4 columns, evenly spaced cells, each cell exactly the same size with the character at exactly the same scale and centered in its cell. Thin magenta grid lines separating the cells.
Row 1 — FRONT view: the character faces the viewer and walks toward the camera. Both eyes visible.
Row 2 — BACK view: the character walks away from the camera. Only the back of the head is visible. No face, no eyes, no nose in any cell of this row.
Row 3 — SIDE view facing LEFT: the character's nose, chest and toes all point toward the LEFT edge of the image, and the character walks leftward. Pure side profile with one eye visible, not a three-quarter turn.
Row 4 — SIDE view facing RIGHT: the character's nose, chest and toes all point toward the RIGHT edge of the image, and the character walks rightward. Row 4 is the horizontal mirror of row 3. Rows 3 and 4 must point in opposite directions — do not draw them both facing the same way.
In every row the 4 cells are one walk cycle and the leg positions must be clearly different from each other: cell 1 left foot forward, cell 2 feet together, cell 3 right foot forward, cell 4 feet together. The character's height, proportions, colors and outline are identical in all 16 cells.
The character is a young potato farmer-cook in a dusty blue apron over a terracotta shirt, brown trousers, dark brown boots, short brown hair, simple dot eyes. Orthographic, no perspective distortion.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, skin #F9E1C4, hair brown #785343, trouser brown #95765A, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

> 3·4번째 줄이 또 같은 쪽을 보면 그 시트는 버리고 4-5(옆모습 걷기) 한 줄만 뽑아서 코드에서 좌우 반전한다. 반전하면 좌우가 어긋날 일이 아예 없다.
>
> 프레임 4개가 너무 비슷하면 `4 cells` → `3 cells: left foot forward, both feet together, right foot forward` 로 줄인다.

## 4-3. 정면 걷기 (시트가 안 될 때)

```
The same potato farmer-cook character walking toward the viewer, 3 frames side by side in a single row at identical scale and proportions: left foot forward, both feet together, right foot forward. Wears a dusty blue apron over a terracotta shirt, brown boots, short brown hair, simple dot eyes. Full body, orthographic, no perspective distortion.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 4-4. 뒷모습 걷기

```
The same potato farmer-cook character seen from directly behind, walking away from the viewer, back of the head and apron strings visible, no face at all. 3 frames side by side in a single row at identical scale: left foot forward, both feet together, right foot forward. Dusty blue apron, terracotta shirt, brown boots, short brown hair. Full body, orthographic, no perspective distortion.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 4-5. 옆모습 걷기

```
The same potato farmer-cook character in full side profile facing right, walking. 3 frames side by side in a single row at identical scale: left foot forward, both feet together, right foot forward. Pure side view with one eye visible, not a three-quarter turn. Dusty blue apron, terracotta shirt, brown boots, short brown hair. Full body, orthographic, no perspective distortion.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

> 왼쪽 방향은 이걸 좌우 반전해서 쓴다. 따로 뽑지 않는다.

## 4-6. 밭 갈기 동작

```
The same potato farmer-cook character swinging a hoe downward to till the soil, seen from a top-down three-quarter angle. 3 frames side by side at identical scale: hoe raised above the head, hoe halfway down, hoe striking the ground. Dusty blue apron, terracotta shirt, brown boots, short brown hair. Orthographic.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 4-7. 수확 동작

```
The same potato farmer-cook character bending down to pick a potato up from the ground, seen from a top-down three-quarter angle. 2 frames side by side at identical scale: bending down, standing back up holding a tan potato. Dusty blue apron, terracotta shirt, brown boots, short brown hair. Orthographic.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 4-8. 물 주기 동작

```
The same potato farmer-cook character pouring water from a watering can onto the ground, seen from a top-down three-quarter angle. 2 frames side by side at identical scale: tilting the can, water pouring out in a stream. Dusty blue apron, terracotta shirt, brown boots, short brown hair. Orthographic.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 4-9. 손님 1 — 조용한 사람

```
A villager customer standing facing the viewer with the same body proportions as the farmer character. Round friendly face, simple dot eyes, calm closed-mouth expression. Wears a sage green knit vest over a cream shirt. Grey-brown bob haircut. Full body, orthographic, no perspective distortion, nothing underneath — no ground, no floor, no shadow. The entire background must be one solid magenta rectangle, #FF00FF, edge to edge.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 4-10. 손님 2 — 까칠한 사람

```
A villager customer standing facing the viewer with the same body proportions as the farmer character. Slightly grumpy expression, flat straight mouth line, narrow eyes. Wears a terracotta jacket over a beige shirt. Short dark hair. Arms crossed. Full body, orthographic, no perspective distortion, nothing underneath — no ground, no floor, no shadow. The entire background must be one solid magenta rectangle, #FF00FF, edge to edge.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 4-11. 손님 3 — 밝은 사람

```
A villager customer standing facing the viewer with the same body proportions as the farmer character. Cheerful open smile, happy curved eyes. Wears a dusty lavender coat and a wide brown straw hat. Full body, orthographic, no perspective distortion, nothing underneath — no ground, no floor, no shadow. The entire background must be one solid magenta rectangle, #FF00FF, edge to edge.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 4-12. 손님 4 — 할머니

```
A small elderly villager customer standing facing the viewer, same art style as the farmer character but shorter and rounder. Cream shawl over a sage green dress, white hair in a bun, warm closed-eye smile with soft round cheeks. Full body, orthographic, no perspective distortion, nothing underneath — no ground, no floor, no shadow. The entire background must be one solid magenta rectangle, #FF00FF, edge to edge.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 4-13. 손님 5 — 아이

```
A child villager customer standing facing the viewer, same art style as the farmer character but noticeably shorter with a proportionally bigger head. Yellow-beige overalls over a cream shirt, messy brown hair, excited open mouth and wide round eyes. Full body, orthographic, no perspective distortion, nothing underneath — no ground, no floor, no shadow. The entire background must be one solid magenta rectangle, #FF00FF, edge to edge.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 4-14. 손님 표정 시트

```
A sheet of 6 facial expressions for the same villager character, head and shoulders only, arranged in one row of 6 evenly spaced cells at identical scale. In order: neutral waiting, delighted with sparkling eyes, impatient with a flat frown, angry with furrowed brows, surprised with wide round eyes, sleepy with half-closed eyes. The same face shape, hair and colors in all 6 cells. Orthographic, straight-on.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 4-15. 감자요정

```
A small round potato fairy floating in the air, about the size of a child's hand. A smooth oval potato body in pale creamy tan with a few darker potato eyes dotted on it. Two tiny translucent pale blue wings. Big friendly dot eyes and a small smile. A tiny four-pointed gold sparkle floating above its head. No arms, two tiny stub legs. Orthographic, no perspective distortion.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 4-16. 빚쿨리

```
A debt collector character standing facing the viewer with the same body proportions as the farmer character. Wears a severe charcoal grey suit that is slightly too big, holds a rolled-up paper under one arm. Narrow squinting eyes, flat unimpressed mouth, slicked-back dark hair. Comically stiff upright posture. Still cute, not scary. Full body, orthographic, no perspective distortion, nothing underneath — no ground, no floor, no shadow. The entire background must be one solid magenta rectangle, #FF00FF, edge to edge.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

---

# 5. 밭

## 5-1. 마른 땅 타일

```
A square ground tile of dry untilled earth, pale warm sandy brown, with a few small scattered pebbles and tiny grass tufts. The tile edges must be seamless so it tiles with copies of itself. Top-down view looking straight down from directly above, orthographic, no perspective, no sense of depth.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Simple and readable at small size.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 5-2. 갈린 밭 타일

```
A square ground tile of freshly tilled soil, darker rich brown, with evenly spaced parallel furrow ridges running horizontally across the tile. The tile edges must be seamless so it tiles with copies of itself. Top-down view looking straight down from directly above, orthographic, no perspective, no sense of depth.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Simple and readable at small size.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 5-3. 심은 땅 타일

```
A square ground tile of tilled soil with one small potato seed piece planted in the center, the soil mounded slightly over it. The tile edges must be seamless so it tiles with copies of itself. Top-down view looking straight down from directly above, orthographic, no perspective, no sense of depth.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Simple and readable at small size.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 5-4. 물 준 땅 타일

```
A square ground tile of wet watered soil, noticeably darker and richer brown than dry soil, with a few small water droplet shapes on the surface. The tile edges must be seamless so it tiles with copies of itself. Top-down view looking straight down from directly above, orthographic, no perspective, no sense of depth.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Simple and readable at small size.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 5-5. 싹 타일

```
A square ground tile of soil with a young potato sprout growing in the center: a short stem with two or three small rounded sage green leaves. The tile edges must be seamless so it tiles with copies of itself. Top-down view looking straight down from directly above, orthographic, no perspective, no sense of depth.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Simple and readable at small size.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 5-6. 다 자란 타일

```
A square ground tile of soil with a fully grown potato plant in the center: a bushy clump of rounded sage green leaves filling most of the tile, with a few tiny white flowers. The tile edges must be seamless so it tiles with copies of itself. Top-down view looking straight down from directly above, orthographic, no perspective, no sense of depth.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Simple and readable at small size.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 5-7. 돌

```
A single grey field stone sitting on the ground, rounded and smooth, roughly the size of a melon. No ground underneath, the object only. Top-down view looking straight down from directly above, orthographic, no perspective.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 5-8. 잡초

```
A single clump of tall weeds, a dense tuft of thin sage green leaves spreading outward from one point. No ground underneath, the object only. Top-down view looking straight down from directly above, orthographic, no perspective.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 5-9. 나뭇가지

```
A single fallen dry branch lying on the ground, a short forked twig in grey-brown. No ground underneath, the object only. Top-down view looking straight down from directly above, orthographic, no perspective.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 5-10. 나무

```
A single small tree seen from directly above: a round bushy canopy of sage green leaves with a hint of the brown trunk at the very center. No ground underneath, the object only. Top-down view looking straight down from directly above, orthographic, no perspective.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 5-11. 나무 그루터기

```
A tree stump seen from directly above: a flat circular cut surface in pale tan with concentric growth rings, surrounded by a ring of darker brown bark. No ground underneath, the object only. Top-down view looking straight down from directly above, orthographic, no perspective.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 5-12. 할머니 집

```
A small cozy cottage with a warm terracotta tiled roof, cream plastered walls, a dusty blue wooden door and two small square windows. Slightly weathered and old but cared for. The whole building fits inside the frame. Top-down three-quarter angle, orthographic, no perspective distortion.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 5-13. 감자 창고

```
A small wooden storage shed, open on the front side so the empty plank interior is visible. Warm brown timber walls, sage green roof. The whole building fits inside the frame. Top-down three-quarter angle, orthographic, no perspective distortion.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 5-14. 쌓인 감자 더미

```
A loose heap of about thirty tan potatoes piled into a rounded mound, an isolated object floating in empty space. Do not draw any wooden board, plank, floor, crate, table or surface of any kind under or behind the potatoes. The entire background must be one solid magenta rectangle, #FF00FF, edge to edge. Top-down three-quarter angle, orthographic, no perspective distortion.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 5-15. 마당 바닥 배경

```
A seamless tileable ground texture for a farm yard: patchy sage green grass over pale sandy soil, very low contrast and calm so that objects placed on top of it stay clearly readable. No objects, no rocks, no plants, ground only. Top-down view looking straight down from directly above, orthographic, no perspective.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

---

# 6. 부엌

## 6-1. 싱크대

```
A simple kitchen sink basin, cream ceramic with a dusty blue curved faucet. Shallow and wide, the basin interior visible. Straight-on front view at eye level, orthographic, no perspective, object centered.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 6-2. 도마

```
A wooden cutting board, warm honey-brown wood with a simple rounded edge and a round hanging hole in one corner. Tilted so the top surface is fully visible. Straight-on front view, orthographic, no perspective, object centered.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 6-3. 강판

```
A hand-held box grater standing upright, dusty blue metal with a visible grid of grating holes on the front face and a rounded handle on top. Straight-on front view at eye level, orthographic, no perspective, object centered.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 6-4. 프라이팬 (빈 팬)

```
A round cast-iron frying pan seen from directly above, completely empty, dark charcoal grey with a short warm brown wooden handle pointing toward the bottom of the frame. Orthographic, no perspective.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 6-5. 화구

```
A simple gas stove burner seen from directly above: a dark charcoal circular burner ring on a pale cream stovetop panel. Empty, no pan on it. Orthographic, no perspective.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 6-6. 조리대

```
A long horizontal kitchen counter: a pale cream work surface above a warm beige wooden front panel with two simple drawer lines. Wide and low. Straight-on front view at eye level, orthographic, no perspective.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 6-7. 쓰레기통

```
A small metal waste bin, dusty blue with a slightly tapered body and a thin rim, open at the top. Straight-on front view at eye level, orthographic, no perspective, object centered.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 6-8. 필러

```
A Y-shaped vegetable peeler with a dusty blue plastic handle and a pale grey metal blade. Straight-on front view, orthographic, no perspective, object centered.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 6-9. 칼

```
A kitchen knife in side profile with the blade pointing left: a pale grey blade and a warm brown wooden handle. Straight-on side view, orthographic, no perspective, object centered.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 6-10. 뒤집개

```
A wooden spatula in side profile, warm honey-brown, with a rounded flat head and a long straight handle. Straight-on side view, orthographic, no perspective, object centered.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 6-11. 물뿌리개

```
A metal watering can in side profile, dusty blue, with a long spout pointing left and a rounded carrying handle on top. Straight-on side view, orthographic, no perspective, object centered.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 6-12. 감자 바구니

```
An empty woven basket in warm tan wicker, shallow and wide. Three-quarter view from slightly above, orthographic, nothing underneath it.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

---

# 7. 감자와 요리

## 7-1. 기본 감자

```
A single raw potato, a smooth rounded oval in warm tan with a few small darker dimpled eyes on the surface. Nothing else in the frame. Three-quarter view from slightly above, orthographic, nothing underneath it.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 7-2. 좋은 감자

```
A single premium potato, a smooth rounded oval in a richer golden tan, slightly larger and plumper than an ordinary potato, with a few small darker eyes and a thin warm gold outline ring around it. Three-quarter view from slightly above, orthographic, nothing underneath it.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 7-3. 씨감자

```
A single seed potato piece: a potato cut in half showing the pale cream cut face, with one small pale sprout growing from the skin side. Three-quarter view from slightly above, orthographic, nothing underneath it.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 7-4. 깎은 감자

```
A single peeled potato, a smooth rounded oval in pale creamy yellow with no skin and no eyes at all. Nothing else in the frame. Three-quarter view from slightly above, orthographic, nothing underneath it.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 7-5. 감자채

```
A small neat pile of raw potato julienne sticks, thin matchstick strips in pale creamy yellow heaped into a loose mound. Three-quarter view from slightly above, orthographic, nothing underneath it.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 7-6. 감자 반죽

```
A small mound of grated raw potato batter, a soft heap in pale creamy yellow with a slightly rough irregular edge. Three-quarter view from slightly above, orthographic, nothing underneath it.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 7-7. 통감자 구이

```
A whole roasted potato on a small cream plate. The potato skin is golden brown with a few darker roasted patches. Three-quarter view from slightly above, orthographic. The plate floats on its own with nothing underneath — no table, no counter, no tablecloth. The entire background must be one solid magenta rectangle, #FF00FF, edge to edge.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 7-8. 감자채 볶음

```
A portion of stir-fried potato julienne on a small cream plate: pale golden strips tangled into a neat mound. Three-quarter view from slightly above, orthographic. The plate floats on its own with nothing underneath — no table, no counter, no tablecloth. The entire background must be one solid magenta rectangle, #FF00FF, edge to edge.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 7-9. 감자전

```
A round Korean potato pancake on a small cream plate: a flat golden-brown disc with slightly crispy irregular edges. Three-quarter view from slightly above, orthographic. The plate floats on its own with nothing underneath — no table, no counter, no tablecloth. The entire background must be one solid magenta rectangle, #FF00FF, edge to edge.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 7-10. 탄 감자전

```
A round Korean potato pancake that has been burnt, on a small cream plate: the disc is dark charred brown with blackened patches, with two small wisps of grey smoke rising from it. Three-quarter view from slightly above, orthographic. The plate floats on its own with nothing underneath — no table, no counter, no tablecloth. The entire background must be one solid magenta rectangle, #FF00FF, edge to edge.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 7-11. 팬 위 — 안 익음

```
A round potato pancake cooking in a frying pan seen from directly above. The pan is dark charcoal grey with a short brown handle pointing down, and the pancake in the center is pale raw uncooked batter. Orthographic, no perspective.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 7-12. 팬 위 — 다 익음

```
A round potato pancake cooking in a frying pan seen from directly above. The pan is dark charcoal grey with a short brown handle pointing down, and the pancake in the center is fully cooked golden brown with slightly crisp edges. Orthographic, no perspective.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 7-13. 감자전 탑

```
A tall neat stack of about twelve round golden-brown potato pancakes piled on a cream plate, leaning very slightly. Straight-on front view at eye level, orthographic, no perspective. The plate floats on its own with nothing underneath — no table, no counter, no tablecloth. The entire background must be one solid magenta rectangle, #FF00FF, edge to edge.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline on every shape, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, potato tan #D6AC77, outline brown #563529. Soft rounded shapes, calm cozy storybook feel. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

---

# 8. UI

## 8-1. 패널 프레임

```
A horizontal UI panel frame for a cozy mobile game: a rounded rectangle filled cream with a thick warm brown outline and a thin warm beige inner border line. Completely empty, no text, no icons, no decoration inside. Flat 2D interface element, straight-on, no perspective, no 3D bevel.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, outline brown #563529. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 8-2. 버튼

```
Two rounded rectangular buttons for a cozy mobile game side by side at identical size: the left one filled dusty blue, the right one filled terracotta, both with a thick warm brown outline. Completely empty, no text, no icons. Flat 2D interface element, straight-on, no perspective, no 3D bevel.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, outline brown #563529. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 8-3. 말풍선

```
A speech bubble for a cozy mobile game: a rounded rectangle filled cream with a thick warm brown outline and a small pointed tail at the bottom left corner. Completely empty, no text. Flat 2D interface element, straight-on, no perspective, no 3D bevel.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, outline brown #563529. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 8-4. 가로 게이지

```
A horizontal progress gauge for a cozy mobile game: a rounded capsule with a thick warm brown outline, filled about seventy percent from the left with sage green, the remaining part empty cream. No text, no numbers. Flat 2D interface element, straight-on, no perspective, no 3D bevel.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, outline brown #563529. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 8-5. 세로 인내심 게이지

```
A narrow vertical gauge for a cozy mobile game: a tall rounded capsule with a thick warm brown outline, filled from the bottom about forty percent with terracotta, the rest empty cream. No text, no numbers. Flat 2D interface element, straight-on, no perspective, no 3D bevel.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, outline brown #563529. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 8-6. 계산서 종이

```
A paper receipt for a cozy mobile game: a tall narrow rectangle filled cream with a zigzag torn edge along the bottom and a thick warm brown outline. Completely blank, no text, no printed lines, no numbers. Flat 2D interface element, straight-on, no perspective, no 3D bevel.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, dusty blue #9EB0B9, sage green #A8B192, terracotta #D38A72, outline brown #563529. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 8-7. 동전 아이콘

```
A small coin icon for a cozy mobile game: a simple flat circle in warm golden tan with a thick brown outline and a tiny flat potato silhouette in the center. No text, no numbers. Flat 2D interface element, straight-on, no perspective, no 3D bevel.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Muted low-saturation palette only: cream #F6EFE4, warm beige #E8D9C5, potato tan #D6AC77, outline brown #563529. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

---

# 9. 이펙트

## 9-1. 흙먼지

```
A set of 5 cartoon dust puff shapes arranged in a row, each a soft rounded cloud outline filled pale cream with a thick brown outline, growing progressively larger from left to right. Flat, simple, no gradients. Straight-on, orthographic.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 9-2. 연기

```
A set of 4 cartoon smoke wisp shapes arranged in a row, each a curling ribbon of pale grey smoke with a thick brown outline, rising and widening progressively from left to right. Flat, simple, no gradients. Straight-on, orthographic.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 9-3. 물방울

```
A set of 5 water droplet shapes arranged in a row, each a simple teardrop filled dusty blue with a thick brown outline, in five different sizes. Flat, simple, no gradients. Straight-on, orthographic.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 9-4. 반짝임

```
A set of 4 sparkle shapes arranged in a row: a large four-pointed star, a small four-pointed star, a tiny diamond, and a small circle. All filled pale warm gold with a thin brown outline. Flat, simple, no gradients. Straight-on, orthographic.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

## 9-5. 감자 껍질

```
A set of 3 potato peel curl shapes arranged in a row: thin curved ribbons of potato skin filled warm tan with a thick brown outline, each curled differently. Flat, simple, no gradients. Straight-on, orthographic.
Flat vector game asset, cozy mobile game art. Uniform thick dark-brown outline, exactly the same stroke weight throughout. Completely flat solid color fills — no gradients, no shading, no highlights, no texture, no drop shadows. Solid flat magenta background, exact color #FF00FF, no shadow.
Match the attached reference image exactly: same outline weight, same palette, same level of detail, same flat shading. This is the same game's art set.
```

---

# 10. 뽑고 나서

- [ ] 마젠타 배경 제거
- [ ] 타일은 4장 붙여놓고 솔기 보이는지 확인
- [ ] 스프라이트 시트 셀 크기 균일한지 확인, 아니면 잘라서 재배치
- [ ] 전부 한 폴더에 모아 한눈에 보고 톤 튀는 것 골라내기
- [ ] 외곽선 굵기가 제각각이면 제일 많이 나온 굵기 기준으로 나머지 재생성
- [ ] 파일명: `tile_tilled.png`, `char_walk_down_01.png`, `item_potato_raw.png`

# 11. 안 나올 때 덧붙일 말

| 증상 | 덧붙일 문장 |
| --- | --- |
| 그림자나 음영이 들어감 | `Completely flat, no shading whatsoever, as if filled with a paint bucket tool.` |
| 외곽선이 얇거나 없음 | `Bold uniform outline at least 4 pixels thick at this resolution.` |
| 너무 디테일함 | `Extremely simplified, minimal detail, as few shapes as possible.` |
| 색이 쨍함 | `Desaturated, dusty, muted, low chroma, nothing vivid.` |
| 원근이 들어감 | `Strictly orthographic, flat 2D, no vanishing point.` |
| 배경이 마젠타가 아님 | `The entire background must be one solid magenta rectangle, #FF00FF, edge to edge.` |
| 프레임마다 캐릭터가 달라짐 | 레퍼런스 첨부 + `Identical character, only the pose changes.` |
