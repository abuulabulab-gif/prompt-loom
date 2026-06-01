export const FEATURE_CATS = [
  { id:'face',      ja:'顔の特徴',    en:'Face',        icon:'✨' },
  { id:'body',      ja:'体の特徴',    en:'Body',        icon:'💫' },
  { id:'accessory', ja:'小物・アクセ', en:'Accessories', icon:'💍' },
];

export const FEATURE_ITEMS = {
  face: [
    {
      id:'mole', ja:'ほくろ', en:'Mole',
      targetBlock:'face',
      lrWarning:true,
      options:[
        { ja:'左目の下',       en:'small mole under left eye' },
        { ja:'右目の下',       en:'small mole under right eye' },
        { ja:'左頬',           en:'small mole on left cheek' },
        { ja:'右頬',           en:'small mole on right cheek' },
        { ja:'泣きぼくろ（口元）', en:'beauty mark near mouth' },
      ],
    },
    {
      id:'freckles', ja:'そばかす', en:'Freckles',
      targetBlock:'face',
      options:[
        { ja:'頬に',     en:'freckles on cheeks' },
        { ja:'鼻に薄く', en:'light freckles across nose' },
        { ja:'薄く',     en:'subtle freckles' },
      ],
    },
    {
      id:'face_scar', ja:'傷跡', en:'Scar',
      targetBlock:'face',
      lrWarning:true,
      options:[
        { ja:'左頬',     en:'small scar on left cheek' },
        { ja:'右頬',     en:'small scar on right cheek' },
        { ja:'左眉の上', en:'subtle scar over left eyebrow' },
        { ja:'右眉の上', en:'subtle scar over right eyebrow' },
        { ja:'鼻',       en:'scar on nose' },
      ],
    },
    {
      id:'birthmark', ja:'あざ', en:'Birthmark',
      targetBlock:'face',
      options:[
        { ja:'頬', en:'small birthmark on cheek' },
        { ja:'首', en:'subtle birthmark on neck' },
      ],
    },
    {
      id:'bandaid_face', ja:'絆創膏', en:'Bandaid',
      targetBlock:'face',
      lrWarning:true,
      options:[
        { ja:'左頬', en:'bandaid on left cheek' },
        { ja:'右頬', en:'bandaid on right cheek' },
        { ja:'鼻',   en:'bandaid on nose' },
        { ja:'額',   en:'bandaid on forehead' },
      ],
    },
  ],
  body: [
    {
      id:'body_mole', ja:'ほくろ', en:'Mole',
      targetBlock:'body',
      lrWarning:true,
      options:[
        { ja:'首',       en:'small mole on neck' },
        { ja:'鎖骨',     en:'small mole on collarbone' },
        { ja:'肩',       en:'small mole on shoulder' },
        { ja:'胸元',     en:'small mole on upper chest' },
        { ja:'太もも',   en:'small mole on thigh' },
      ],
    },
    {
      id:'body_scar', ja:'傷跡', en:'Scar',
      targetBlock:'body',
      options:[
        { ja:'肩',     en:'small scar on shoulder' },
        { ja:'腕',     en:'small scar on arm' },
        { ja:'太もも', en:'small scar on thigh' },
      ],
    },
    {
      id:'body_birthmark', ja:'あざ', en:'Birthmark',
      targetBlock:'body',
      options:[
        { ja:'肩',     en:'subtle birthmark on shoulder' },
        { ja:'太もも', en:'subtle birthmark on upper thigh' },
        { ja:'背中',   en:'birthmark on back' },
      ],
    },
    {
      id:'tattoo', ja:'タトゥー', en:'Tattoo',
      targetBlock:'body',
      options:[
        { ja:'腕',   en:'small tattoo on arm' },
        { ja:'肩',   en:'tattoo on shoulder' },
        { ja:'背中', en:'back tattoo' },
      ],
    },
    {
      id:'bandage', ja:'包帯', en:'Bandage',
      targetBlock:'body',
      options:[
        { ja:'腕', en:'bandage on arm' },
        { ja:'脚', en:'bandage on leg' },
      ],
    },
    {
      id:'bandaid_body', ja:'絆創膏', en:'Bandaid',
      targetBlock:'body',
      options:[
        { ja:'腕', en:'bandaid on arm' },
        { ja:'膝', en:'bandaid on knee' },
        { ja:'脚', en:'bandaid on leg' },
      ],
    },
  ],
  accessory: [
    {
      id:'piercing_pos', ja:'ピアス', en:'Piercing',
      targetBlock:'body',
      lrWarning:true,
      options:[
        { ja:'両耳',   en:'ear piercing' },
        { ja:'左耳',   en:'ear piercing left ear' },
        { ja:'右耳',   en:'ear piercing right ear' },
        { ja:'へそ',   en:'navel piercing' },
        { ja:'リップ', en:'lip piercing' },
        { ja:'鼻',     en:'nose piercing' },
      ],
    },
    {
      id:'glasses_pos', ja:'眼鏡', en:'Glasses',
      targetBlock:'outfit',
      subtypes:[
        {
          id:'normal', ja:'ノーマル',
          options:[
            { ja:'着用中',     en:'wearing glasses' },
            { ja:'頭に乗せる', en:'glasses on head' },
          ],
        },
        {
          id:'under_rim', ja:'アンダーリム',
          options:[
            { ja:'着用中',     en:'under-rim glasses' },
            { ja:'頭に乗せる', en:'under-rim glasses on head' },
          ],
        },
        {
          id:'half_rim', ja:'ハーフリム',
          options:[
            { ja:'着用中',     en:'half-rim glasses' },
            { ja:'頭に乗せる', en:'half-rim glasses on head' },
          ],
        },
        {
          id:'round', ja:'丸メガネ',
          options:[
            { ja:'着用中',     en:'round eyewear' },
            { ja:'頭に乗せる', en:'round eyewear on head' },
          ],
        },
        {
          id:'square', ja:'スクエア',
          options:[
            { ja:'着用中',     en:'square eyewear' },
            { ja:'頭に乗せる', en:'square eyewear on head' },
          ],
        },
        {
          id:'goggles', ja:'ゴーグル',
          options:[
            { ja:'着用中',     en:'goggles' },
            { ja:'頭に乗せる', en:'goggles on head' },
          ],
        },
      ],
    },
    {
      id:'sunglasses_pos', ja:'サングラス', en:'Sunglasses',
      targetBlock:'outfit',
      options:[
        { ja:'着用中',       en:'wearing sunglasses' },
        { ja:'頭に乗せる',   en:'sunglasses on head' },
        { ja:'首元にかける', en:'sunglasses hanging from collar' },
      ],
    },
    {
      id:'eyepatch_pos', ja:'眼帯', en:'Eyepatch',
      targetBlock:'face',
      lrWarning:true,
      options:[
        { ja:'左目', en:'eyepatch over left eye' },
        { ja:'右目', en:'eyepatch over right eye' },
      ],
    },
    {
      id:'headphones_pos', ja:'ヘッドホン', en:'Headphones',
      targetBlock:'outfit',
      options:[
        { ja:'着用中',     en:'wearing headphones' },
        { ja:'首にかける', en:'headphones around neck' },
      ],
    },
    {
      id:'face_mask_pos', ja:'マスク', en:'Face Mask',
      targetBlock:'face',
      options:[
        { ja:'着用中',     en:'wearing face mask' },
        { ja:'下げている', en:'face mask pulled down' },
      ],
    },
  ],
};
