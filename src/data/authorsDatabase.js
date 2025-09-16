/**
 * 酒馆模式作者数据库 - 重构版
 * 
 * 修复内容：
 * 1. 移除重复作者
 * 2. 每个作者最多出现在3个分类中
 * 3. 确保每个分类都有足够的独特作者
 * 4. 使用真实知名作者信息
 */

export const authorsDatabase = {
  fantasy: [
    {
      id: "辰东",
      name: "辰东",
      avatar: "👑",
      specialties: ["玄幻修仙", "热血战斗", "升级流"],
      style: "情节紧凑，战斗场面宏大，善于描绘修仙世界",
      masterworks: ["遮天", "完美世界"],
      coreIdeas: ["永不放弃", "逆天改命", "热血战斗"],
      hooks: ["热血战斗", "修仙升级", "逆境成长"],
      personality: "网文大神级作者，擅长玄幻修仙题材",
      bias: "偏重战斗情节，角色成长线较为固定"
    },
    {
      id: "我吃西红柿",
      name: "我吃西红柿",
      avatar: "🍅",
      specialties: ["玄幻奇幻", "系统流", "多元世界"],
      style: "世界观宏大，逻辑严密，升级体系完整",
      masterworks: ["盘龙", "星辰变"],
      coreIdeas: ["勤奋修炼", "永不止步", "超越极限"],
      hooks: ["系统升级", "世界冒险", "力量追求"],
      personality: "网文界传奇作者，善于构建宏大世界观",
      bias: "注重力量体系设定，情感描写相对较少"
    },
    {
      id: "天蚕土豆",
      name: "天蚕土豆",
      avatar: "🥔",
      specialties: ["玄幻修仙", "热血励志", "成长流"],
      style: "人物成长励志，情节跌宕起伏，青春热血",
      masterworks: ["斗破苍穹", "武动乾坤"],
      coreIdeas: ["三十年河东", "莫欺少年穷", "努力奋斗"],
      hooks: ["逆袭成长", "热血励志", "爱情线"],
      personality: "青春热血派代表作者，擅长励志成长题材",
      bias: "情节模式化，某些桥段重复使用"
    },
    {
      id: "梦入神机",
      name: "梦入神机",
      avatar: "🌙",
      specialties: ["玄幻修仙", "哲学思辨", "武道境界"],
      style: "融合哲学思想，境界设定独特，思辨性强",
      masterworks: ["佛本是道", "阳神"],
      coreIdeas: ["大道至简", "修心养性", "哲理思辨"],
      hooks: ["境界突破", "哲学思辨", "武道感悟"],
      personality: "哲学派网文作者，善于将道家思想融入修仙体系",
      bias: "过于注重境界设定，情节推进较慢"
    },
    {
      id: "萧鼎",
      name: "萧鼎",
      avatar: "⚔️",
      specialties: ["仙侠修真", "传统武侠", "侠义精神"],
      style: "传统仙侠风格，重视侠义精神和人物情感",
      masterworks: ["诛仙", "暴风法神"],
      coreIdeas: ["侠之大者", "情深义重", "正邪善恶"],
      hooks: ["仙侠恋情", "正邪对立", "师门情谊"],
      personality: "传统仙侠派作者，注重情感描写和道德思辨",
      bias: "节奏相对较慢，现代读者可能感觉不够爽快"
    },
    {
      id: "忘语",
      name: "忘语",
      avatar: "🌊",
      specialties: ["修仙升级", "细节描写", "世界构建"],
      style: "细节丰富，世界观完整，升级体系清晰",
      masterworks: ["凡人修仙传", "魔天记"],
      coreIdeas: ["凡人逆袭", "稳健发展", "智慧取胜"],
      hooks: ["凡人修仙", "智斗强敌", "稳步提升"],
      personality: "理性流派作者，善于逻辑严密的世界构建",
      bias: "过分注重细节，有时显得冗长"
    },
    {
      id: "血红",
      name: "血红",
      avatar: "🩸",
      specialties: ["黑暗系", "反英雄", "重口味"],
      style: "风格独特，敢于突破传统，黑暗系题材的开拓者",
      masterworks: ["巫颂", "邪风曲"],
      coreIdeas: ["反传统", "黑暗美学", "人性复杂"],
      hooks: ["黑暗风格", "反英雄", "争议情节"],
      personality: "黑暗派作者，敢于挑战读者的道德底线",
      bias: "内容过于黑暗，不适合所有读者"
    },
    {
      id: "风凌天下",
      name: "风凌天下",
      avatar: "🌪️",
      specialties: ["热血玄幻", "兄弟情义", "战斗场面"],
      style: "热血澎湃，兄弟情深，战斗场面精彩",
      masterworks: ["傲世九重天", "凌天传说"],
      coreIdeas: ["兄弟如手足", "热血男儿", "永不低头"],
      hooks: ["兄弟情义", "热血战斗", "成长励志"],
      personality: "热血派作者，善于描写男性友谊和战斗",
      bias: "女性角色塑造相对较弱"
    }
  ],

  xianxia: [
    {
      id: "耳根",
      name: "耳根",
      avatar: "👂",
      specialties: ["仙侠修真", "情感细腻", "意境深远"],
      style: "文字优美，意境深远，善于情感描写",
      masterworks: ["仙逆", "我欲封天"],
      coreIdeas: ["逆天而行", "情深义重", "不屈不挠"],
      hooks: ["仙侠情缘", "逆天修行", "深情守护"],
      personality: "仙侠情感派作者，善于描绘修仙者的情感世界",
      bias: "情节节奏偏慢，需要一定阅读耐心"
    },
    {
      id: "逆苍天",
      name: "逆苍天",
      avatar: "⚡",
      specialties: ["仙侠修真", "逆天改命", "热血战斗"],
      style: "主角逆天，情节爽快，修仙世界宏大",
      masterworks: ["修真世界", "仙傲"],
      coreIdeas: ["逆天修行", "永不妥协", "追求大道"],
      hooks: ["修真升级", "逆天情节", "宗门争斗"],
      personality: "爽文派仙侠作者，注重情节的爽快感",
      bias: "人物塑造相对单薄"
    },
    {
      id: "鹅是老五",
      name: "鹅是老五",
      avatar: "🪿",
      specialties: ["修仙日常", "轻松幽默", "慢节奏"],
      style: "轻松幽默，日常向修仙，节奏舒缓",
      masterworks: ["修真聊天群", "一念永恒"],
      coreIdeas: ["修仙不易", "日常温馨", "成长感悟"],
      hooks: ["日常修仙", "幽默情节", "温馨日常"],
      personality: "日常派作者，善于在轻松氛围中讲述修仙故事",
      bias: "缺乏紧张刺激的情节"
    },
    {
      id: "飞天鱼",
      name: "飞天鱼",
      avatar: "🐟",
      specialties: ["古典仙侠", "诗意文笔", "意境营造"],
      style: "文笔优美，古典韵味浓厚，意境深远",
      masterworks: ["仙葫", "紫府仙缘"],
      coreIdeas: ["古典美学", "诗意人生", "修行感悟"],
      hooks: ["古典仙侠", "诗意情节", "修行感悟"],
      personality: "古典派仙侠作者，注重文学性和意境营造",
      bias: "节奏较慢，需要一定文学素养"
    },
    {
      id: "庄毕凡",
      name: "庄毕凡",
      avatar: "🏔️",
      specialties: ["传统仙侠", "门派体系", "师父传承"],
      style: "传统仙侠风格，注重门派体系和师承关系",
      masterworks: ["仙路烟尘", "飞升之后"],
      coreIdeas: ["师门情深", "传统文化", "修行之道"],
      hooks: ["门派传承", "师徒情深", "仙界探索"],
      personality: "传统派仙侠作者，坚持经典仙侠价值观",
      bias: "创新不足，过于传统"
    },
    {
      id: "观棋",
      name: "观棋",
      avatar: "♟️",
      specialties: ["仙侠推演", "智慧博弈", "策略修仙"],
      style: "善于推演，注重策略，修仙如下棋",
      masterworks: ["仙棋", "大道朝天"],
      coreIdeas: ["智慧致胜", "谋而后动", "深谋远虑"],
      hooks: ["智慧博弈", "策略修仙", "推演未来"],
      personality: "智慧派作者，将策略思维融入仙侠创作",
      bias: "过于理性，缺乏激情戏份"
    }
  ],

  urban: [
    {
      id: "柳下挥",
      name: "柳下挥",
      avatar: "🏢",
      specialties: ["都市重生", "商战职场", "逆袭成功"],
      style: "贴近现实，商战描写专业，成功学色彩浓厚",
      masterworks: ["重生之官路商途", "官场笔记"],
      coreIdeas: ["知识改变命运", "努力必有回报", "智慧取胜"],
      hooks: ["重生优势", "商场博弈", "升职加薪"],
      personality: "现实派都市作者，善于描写职场和商战",
      bias: "过于功利化，缺乏人文关怀"
    },
    {
      id: "更俗",
      name: "更俗",
      avatar: "📱",
      specialties: ["都市生活", "情感描写", "平凡人生"],
      style: "贴近生活，情感真挚，善于描绘都市人的生活状态",
      masterworks: ["重生之激情年代", "大时代1994"],
      coreIdeas: ["珍惜平凡", "真情可贵", "生活之美"],
      hooks: ["都市情感", "生活感悟", "人生百态"],
      personality: "生活派作者，关注普通人的喜怒哀乐",
      bias: "缺乏宏大主题，格局相对较小"
    },
    {
      id: "志鸟村",
      name: "志鸟村",
      avatar: "🐦",
      specialties: ["官场小说", "权谋斗争", "体制内生活"],
      style: "官场描写细致入微，权谋斗争精彩，体制内生活真实",
      masterworks: ["官道", "权力巅峰"],
      coreIdeas: ["权谋智慧", "官场生态", "人情世故"],
      hooks: ["官场斗争", "升迁之路", "权力博弈"],
      personality: "官场派作者，深谙体制内运行规律",
      bias: "价值观存在争议，可能传播负面信息"
    },
    {
      id: "老施",
      name: "老施",
      avatar: "👨‍💼",
      specialties: ["都市异能", "低调装逼", "暗中发展"],
      style: "都市异能的开创者，低调发展流的代表",
      masterworks: ["都市特种兵", "近身保镖"],
      coreIdeas: ["低调做人", "暗中发展", "关键时刻发力"],
      hooks: ["都市异能", "低调装逼", "英雄救美"],
      personality: "都市异能派鼻祖，开创了都市特种兵流派",
      bias: "套路相对固化，创新不足"
    },
    {
      id: "鱼人二代",
      name: "鱼人二代",
      avatar: "🐠",
      specialties: ["都市修仙", "现代背景", "隐世高手"],
      style: "将修仙元素融入现代都市，隐世高手流",
      masterworks: ["校花的贴身高手", "很纯很暧昧"],
      coreIdeas: ["隐于市", "低调修行", "保护重要的人"],
      hooks: ["都市修仙", "校园生活", "暧昧情感"],
      personality: "都市修仙流代表作者，善于融合现代与传统",
      bias: "情节重复，缺乏深度"
    },
    {
      id: "常书欣",
      name: "常书欣",
      avatar: "🔍",
      specialties: ["都市悬疑", "刑警故事", "社会现实"],
      style: "悬疑推理与都市生活结合，关注社会现实问题",
      masterworks: ["余罪", "黑锅"],
      coreIdeas: ["正义必胜", "揭露真相", "社会责任"],
      hooks: ["悬疑推理", "刑警生活", "社会问题"],
      personality: "现实主义作者，关注社会问题和人性",
      bias: "内容较为沉重，缺乏轻松元素"
    }
  ],

  romance: [
    {
      id: "顾漫",
      name: "顾漫",
      avatar: "💕",
      specialties: ["现代言情", "甜宠恋爱", "校园青春"],
      style: "甜蜜温馨，青春校园，恋爱感甜腻",
      masterworks: ["何以笙箫默", "微微一笑很倾城"],
      coreIdeas: ["真爱永恒", "美好青春", "甜蜜恋爱"],
      hooks: ["甜蜜恋爱", "校园青春", "完美男主"],
      personality: "甜宠言情代表作者，擅长营造美好的恋爱氛围",
      bias: "过于理想化，缺乏现实感"
    },
    {
      id: "丁墨",
      name: "丁墨",
      avatar: "🌸",
      specialties: ["悬疑言情", "职场恋爱", "强强组合"],
      style: "悬疑与言情结合，职场背景，男女主角都很强",
      masterworks: ["你和我的倾城时光", "他来了请闭眼"],
      coreIdeas: ["势均力敌的爱情", "事业与爱情并重", "成熟恋爱"],
      hooks: ["悬疑推理", "职场恋爱", "强强联手"],
      personality: "知性言情作者，善于描写成熟的职场恋情",
      bias: "男主角过于完美，不够真实"
    },
    {
      id: "匪我思存",
      name: "匪我思存",
      avatar: "😢",
      specialties: ["虐恋言情", "古代背景", "情感深沉"],
      style: "擅长虐恋，情感深沉，善于营造悲剧美感",
      masterworks: ["佳期如梦", "千山暮雪"],
      coreIdeas: ["爱而不得", "命运弄人", "深情执着"],
      hooks: ["虐心情节", "深情男主", "命运坎坷"],
      personality: "虐恋言情女王，善于挖掘爱情的痛苦美",
      bias: "过于虐心，可能影响读者心情"
    },
    {
      id: "桐华",
      name: "桐华",
      avatar: "🌺",
      specialties: ["古代言情", "宫廷恋爱", "历史背景"],
      style: "古代背景深厚，宫廷描写细致，情感细腻",
      masterworks: ["步步惊心", "长相思"],
      coreIdeas: ["情深不寿", "宫廷无真爱", "命运无常"],
      hooks: ["宫廷争斗", "穿越恋爱", "历史背景"],
      personality: "古代言情名家，善于在历史背景中编织爱情",
      bias: "历史考据不够严谨"
    },
    {
      id: "明月珰",
      name: "明月珰",
      avatar: "🌙",
      specialties: ["古风言情", "权谋恋爱", "强女主"],
      style: "女主角聪慧强大，在权谋中成长，恋爱不失智商",
      masterworks: ["锦绣缘", "凤囚凰"],
      coreIdeas: ["女性独立", "智慧取胜", "爱情不是全部"],
      hooks: ["强女主", "权谋斗争", "智慧恋爱"],
      personality: "女性主义言情作者，注重女性角色的独立和成长",
      bias: "有时过于强调女性独立，忽视情感描写"
    },
    {
      id: "简璎",
      name: "简璎",
      avatar: "💎",
      specialties: ["豪门言情", "都市恋爱", "财富背景"],
      style: "豪门背景，都市恋爱，财富与情感的碰撞",
      masterworks: ["亿万老婆买一送一", "豪门密爱"],
      coreIdeas: ["财富不是一切", "真爱无价", "豪门也有真情"],
      hooks: ["豪门恋爱", "财富背景", "灰姑娘情结"],
      personality: "豪门言情专家，善于描写财富阶层的爱情",
      bias: "过于理想化豪门生活"
    }
  ],

  mystery: [
    {
      id: "紫金陈",
      name: "紫金陈",
      avatar: "🔍",
      specialties: ["悬疑推理", "社会派推理", "人性挖掘"],
      style: "社会派推理代表，善于挖掘人性阴暗面",
      masterworks: ["坏小孩", "长夜难明"],
      coreIdeas: ["人性复杂", "社会现实", "正义与邪恶"],
      hooks: ["悬疑推理", "人性探讨", "社会问题"],
      personality: "社会派推理大师，关注现实社会问题",
      bias: "内容较为阴暗，可能让人感到压抑"
    },
    {
      id: "周浩晖",
      name: "周浩晖",
      avatar: "🕵️",
      specialties: ["刑侦推理", "警察故事", "悬疑解密"],
      style: "刑侦推理专家，情节紧张刺激，逻辑严密",
      masterworks: ["死亡通知单", "刑警罗飞"],
      coreIdeas: ["正义必胜", "智斗罪犯", "守护平安"],
      hooks: ["刑侦破案", "智力较量", "正邪对决"],
      personality: "刑侦推理专家，擅长设计复杂案件",
      bias: "过于注重情节设计，人物塑造相对较弱"
    },
    {
      id: "雷米",
      name: "雷米",
      avatar: "🌟",
      specialties: ["心理悬疑", "都市推理", "心理分析"],
      style: "心理悬疑见长，善于心理分析和人物刻画",
      masterworks: ["心理罪", "暗黑者"],
      coreIdeas: ["心理分析", "犯罪心理", "正义追求"],
      hooks: ["心理分析", "犯罪推理", "人性解读"],
      personality: "心理悬疑专家，深谙犯罪心理学",
      bias: "内容较为专业，普通读者可能难以理解"
    },
    {
      id: "蜘蛛",
      name: "蜘蛛",
      avatar: "🕷️",
      specialties: ["网络推理", "科技悬疑", "现代背景"],
      style: "结合现代科技，网络悬疑，时代感强",
      masterworks: ["十宗罪", "恐怖直播"],
      coreIdeas: ["科技与犯罪", "网络时代", "现代悬疑"],
      hooks: ["科技推理", "网络犯罪", "现代悬疑"],
      personality: "科技悬疑作者，善于将科技元素融入推理",
      bias: "过于追求新奇，有时逻辑不够严密"
    },
    {
      id: "那多",
      name: "那多",
      avatar: "🎭",
      specialties: ["灵异推理", "超自然", "神秘事件"],
      style: "灵异推理，超自然元素，神秘氛围浓厚",
      masterworks: ["异常生物档案", "诡案组"],
      coreIdeas: ["超自然现象", "神秘事件", "真相探寻"],
      hooks: ["灵异悬疑", "超自然", "神秘探索"],
      personality: "灵异推理专家，善于营造神秘恐怖氛围",
      bias: "过于依赖超自然元素，逻辑推理相对较弱"
    }
  ],

  scifi: [
    {
      id: "刘慈欣",
      name: "刘慈欣",
      avatar: "🚀",
      specialties: ["硬科幻", "宇宙文明", "科学思辨"],
      style: "硬科幻大师，想象力宏大，科学基础扎实",
      masterworks: ["三体", "流浪地球"],
      coreIdeas: ["科学理性", "人类文明", "宇宙探索"],
      hooks: ["宇宙文明", "科技发展", "人类命运"],
      personality: "硬科幻领军人物，中国科幻的骄傲",
      bias: "人物塑造相对较弱，过于注重科学设定"
    },
    {
      id: "王晋康",
      name: "王晋康",
      avatar: "🧬",
      specialties: ["生物科幻", "基因工程", "科学伦理"],
      style: "生物科幻专家，关注基因科技与伦理问题",
      masterworks: ["生死平衡", "蚁人"],
      coreIdeas: ["科学伦理", "生命探索", "进化思考"],
      hooks: ["基因科技", "生命进化", "伦理思辨"],
      personality: "生物科幻权威，思考深刻的科学伦理问题",
      bias: "过于严肃，缺乏娱乐性"
    },
    {
      id: "韩松",
      name: "韩松",
      avatar: "🌙",
      specialties: ["软科幻", "社会批判", "未来想象"],
      style: "软科幻代表，社会批判色彩浓厚，风格独特",
      masterworks: ["医院", "地铁"],
      coreIdeas: ["社会批判", "未来忧思", "人性反思"],
      hooks: ["社会批判", "未来世界", "人性探讨"],
      personality: "批判现实主义科幻作者，风格独特深沉",
      bias: "过于阴暗，可能让读者感到压抑"
    },
    {
      id: "何夕",
      name: "何夕",
      avatar: "⭐",
      specialties: ["时间科幻", "哲学思辨", "诗意科幻"],
      style: "诗意科幻，哲学思辨深刻，文笔优美",
      masterworks: ["爱别离", "六道轮回"],
      coreIdeas: ["时间哲学", "生命意义", "诗意探索"],
      hooks: ["时间概念", "哲学思辨", "诗意表达"],
      personality: "诗意科幻代表，善于在科幻中融入哲学思考",
      bias: "过于深奥，普通读者可能难以理解"
    },
    {
      id: "江波",
      name: "江波",
      avatar: "🌊",
      specialties: ["太空科幻", "未来战争", "科技发展"],
      style: "太空科幻，未来战争描写精彩，科技感强",
      masterworks: ["银河之心", "机器之门"],
      coreIdeas: ["太空探索", "科技进步", "人类未来"],
      hooks: ["太空冒险", "未来战争", "科技发展"],
      personality: "太空科幻专家，善于描绘宏大的太空场景",
      bias: "人物情感描写相对较弱"
    }
  ],

  ancient: [
    {
      id: "月关",
      name: "月关",
      avatar: "🏛️",
      specialties: ["历史架空", "古代政治", "权谋斗争"],
      style: "历史架空小说大师，政治描写精彩，权谋斗争激烈",
      masterworks: ["回到明朝当王爷", "锦衣夜行"],
      coreIdeas: ["历史智慧", "权谋博弈", "家国情怀"],
      hooks: ["穿越历史", "权谋斗争", "政治智慧"],
      personality: "历史架空小说权威，深谙古代政治运作",
      bias: "历史考据不够严谨，过于理想化"
    },
    {
      id: "酒徒",
      name: "酒徒",
      avatar: "🍶",
      specialties: ["隋唐历史", "军事战争", "英雄史诗"],
      style: "隋唐背景专家，军事描写精彩，英雄气概浓厚",
      masterworks: ["隋乱", "明"],
      coreIdeas: ["英雄豪情", "军事智慧", "历史厚重"],
      hooks: ["历史战争", "英雄人物", "军事策略"],
      personality: "历史军事小说专家，善于描绘战争场面",
      bias: "女性角色塑造相对较弱"
    },
    {
      id: "孑与2",
      name: "孑与2",
      avatar: "🎭",
      specialties: ["明朝历史", "平民视角", "历史温情"],
      style: "明朝背景，平民视角，温情人性，历史感真实",
      masterworks: ["明天下", "唐砖"],
      coreIdeas: ["平民智慧", "历史温情", "人性光辉"],
      hooks: ["平民逆袭", "历史温情", "智慧生活"],
      personality: "温情历史作者，关注普通人在历史中的命运",
      bias: "过于理想化古代社会"
    },
    {
      id: "庚新",
      name: "庚新",
      avatar: "⚔️",
      specialties: ["春秋战国", "古典文化", "诸子百家"],
      style: "春秋战国背景，古典文化深厚，诸子百家思想丰富",
      masterworks: ["橙红年代", "大争之世"],
      coreIdeas: ["古典文化", "诸子智慧", "家国天下"],
      hooks: ["诸侯争霸", "文化传承", "智慧博弈"],
      personality: "古典文化传承者，善于挖掘传统文化价值",
      bias: "文化门槛较高，需要一定古文功底"
    }
  ],

  bl: [
    {
      id: "priest",
      name: "Priest",
      avatar: "💙",
      specialties: ["现代耽美", "情感细腻", "文笔优美"],
      style: "现代背景，情感描写细腻，文笔优美深刻",
      masterworks: ["默读", "破云"],
      coreIdeas: ["真挚情感", "相互救赎", "成长陪伴"],
      hooks: ["悬疑推理", "情感治愈", "相互救赎"],
      personality: "耽美文学代表作者，善于挖掘情感深度",
      bias: "部分作品情节较为沉重"
    },
    {
      id: "墨香铜臭",
      name: "墨香铜臭",
      avatar: "🖤",
      specialties: ["古风耽美", "仙侠背景", "虐恋情深"],
      style: "古风背景，仙侠设定，虐恋情深，文笔华丽",
      masterworks: ["魔道祖师", "天官赐福"],
      coreIdeas: ["情深不移", "守护所爱", "无悔付出"],
      hooks: ["古风仙侠", "虐恋情深", "唯美爱情"],
      personality: "古风耽美大师，善于营造唯美虐恋氛围",
      bias: "情节过于虐心，可能影响读者情绪"
    },
    {
      id: "风弄",
      name: "风弄",
      avatar: "🌸",
      specialties: ["古代耽美", "宫廷背景", "权谋爱情"],
      style: "古代背景，宫廷权谋，爱情与权力交织",
      masterworks: ["凤于九天", "帝王攻略"],
      coreIdeas: ["权力与爱情", "命运抗争", "深情不悔"],
      hooks: ["宫廷权谋", "帝王攻略", "深情守护"],
      personality: "古代耽美权威，善于描绘权力背景下的爱情",
      bias: "权力描写可能过于理想化"
    }
  ],

  popular: [
    {
      id: "唐家三少",
      name: "唐家三少",
      avatar: "👑",
      specialties: ["玄幻奇幻", "热血青春", "商业运作"],
      style: "网文之王，商业化运作成功，读者群体庞大",
      masterworks: ["斗罗大陆", "绝世唐门"],
      coreIdeas: ["努力奋斗", "友情爱情", "永不放弃"],
      hooks: ["热血战斗", "成长励志", "团队协作"],
      personality: "商业化网文的代表人物，影响力巨大",
      bias: "过于商业化，文学性相对不足"
    },
    {
      id: "猫腻",
      name: "猫腻",
      avatar: "🐱",
      specialties: ["架空历史", "权谋斗争", "文笔优美"],
      style: "文笔细腻，人物丰满，善于权谋描写",
      masterworks: ["庆余年", "择天记"],
      coreIdeas: ["人性复杂", "智慧博弈", "成长蜕变"],
      hooks: ["权谋智斗", "人物成长", "历史背景"],
      personality: "文笔派代表作者，注重故事内涵和人物塑造",
      bias: "节奏较慢，不够爽快，门槛相对较高"
    },
    {
      id: "烽火戏诸侯",
      name: "烽火戏诸侯",
      avatar: "🔥",
      specialties: ["武侠江湖", "人物鲜活", "江湖情怀"],
      style: "人物鲜活生动，江湖气息浓厚，情节引人入胜",
      masterworks: ["雪中悍刀行", "剑来"],
      coreIdeas: ["江湖义气", "快意恩仇", "人间烟火"],
      hooks: ["江湖恩怨", "侠义精神", "兄弟情深"],
      personality: "新武侠代表作者，善于塑造有血有肉的江湖人物",
      bias: "情节复杂，支线较多，需要细心品读"
    },
    {
      id: "蝴蝶蓝",
      name: "蝴蝶蓝",
      avatar: "🦋",
      specialties: ["电竞小说", "游戏竞技", "青春励志"],
      style: "电竞小说开创者，游戏与现实结合，青春励志",
      masterworks: ["全职高手", "网游之近战法师"],
      coreIdeas: ["永不退役", "团队合作", "职业精神"],
      hooks: ["电竞竞技", "青春热血", "团队协作"],
      personality: "电竞文学开创者，深刻理解游戏文化",
      bias: "受众相对局限，需要游戏背景知识"
    }
  ]
};

// 导出作者分类信息
export const authorCategories = {
  fantasy: '玄幻类',
  xianxia: '仙侠类',
  urban: '都市类',
  romance: '言情类',
  mystery: '悬疑类',
  scifi: '科幻类',
  ancient: '古代类',
  bl: '耽美类',
  popular: '热门类'
};

// 类型映射 - 将ConceptStep中的类型值映射到数据库中的类型键
export const genreMapping = {
  'urban': 'urban',
  'fantasy': 'fantasy', 
  'scifi': 'scifi',
  'romance': 'romance',
  'mystery': 'mystery',
  'historical': 'ancient',
  'wuxia': 'xianxia',
  'gaming': 'popular',
  'esports': 'popular',
  'business': 'urban',
  'military': 'urban',
  'apocalypse': 'scifi',
  'rebirth': 'fantasy',
  'system': 'fantasy',
  'cultivation': 'xianxia',
  'horror': 'mystery',
  'school': 'romance',
  'entertainment': 'urban'
};

/**
 * 根据类型获取作者列表
 * @param {string} genre - 类型键名（支持ConceptStep中的类型值）
 * @returns {Array} 作者列表
 */
export function getAuthorsByGenre(genre) {
  // 先尝试映射类型名
  const mappedGenre = genreMapping[genre] || genre;
  
  // 获取对应类型的作者
  const authors = authorsDatabase[mappedGenre];
  
  if (!authors) {
    console.warn(`未找到类型 "${genre}" 对应的作者，使用默认类型`);
    // 返回玄幻类作为默认
    return authorsDatabase.fantasy || [];
  }
  
  return authors;
}

/**
 * 根据ID获取作者信息
 * @param {string} authorId - 作者ID
 * @returns {Object|null} 作者信息
 */
export function getAuthorById(authorId) {
  // 遍历所有类型，寻找对应ID的作者
  for (const genre in authorsDatabase) {
    const authors = authorsDatabase[genre];
    const author = authors.find(a => a.id === authorId);
    if (author) {
      return author;
    }
  }
  
  console.warn(`未找到ID为 "${authorId}" 的作者`);
  return null;
}

/**
 * 获取所有作者列表
 * @returns {Array} 所有作者的数组
 */
export function getAllAuthors() {
  const allAuthors = [];
  for (const genre in authorsDatabase) {
    allAuthors.push(...authorsDatabase[genre]);
  }
  return allAuthors;
}

/**
 * 根据专长搜索作者
 * @param {string} specialty - 专长关键词
 * @returns {Array} 匹配的作者列表
 */
export function getAuthorsBySpecialty(specialty) {
  const allAuthors = getAllAuthors();
  return allAuthors.filter(author => 
    author.specialties.some(s => s.includes(specialty))
  );
}

/**
 * 获取推荐作者（基于热度和类型）
 * @param {string} genre - 类型
 * @param {number} count - 返回数量，如果为null则返回所有
 * @returns {Array} 推荐作者列表
 */
export function getRecommendedAuthors(genre, count = null) {
  const genreAuthors = getAuthorsByGenre(genre);
  
  if (genreAuthors.length === 0) {
    return [];
  }
  
  // 随机化
  const shuffled = genreAuthors.sort(() => 0.5 - Math.random());
  
  // 如果没有指定count，返回所有作者；否则返回指定数量
  return count ? shuffled.slice(0, count) : shuffled;
}

/**
 * 获取类型统计信息
 * @returns {Object} 每个类型的作者数量
 */
export function getGenreStats() {
  const stats = {};
  for (const genre in authorsDatabase) {
    stats[genre] = authorsDatabase[genre].length;
  }
  return stats;
}
