/**
 * 酒馆模式作者数据库 - 基于真实排行榜数据
 * 数据来源：
 * 1. 2015年中国网络文学十二主神（官方评选）
 * 2. 2016-2020年中国网络小说排行榜获奖作者
 * 3. 各大文学网站白金大神作者
 * 
 * 注意：所有作者信息基于真实数据，一个作者可能出现在多个分类中
 */

export const authorsDatabase = {
  // 玄幻类 - 以东方玄幻、异界大陆为主
  fantasy: [
    {
      id: 'chen_dong',
      name: '辰东',
      avatar: '⭐',
      specialties: ['玄幻', '古典仙侠', '洪荒'],
      style: '气势恢宏，想象奇诡，善于营造史诗氛围，文笔华丽',
      masterworks: ['遮天', '完美世界', '圣墟'],
      coreIdeas: ['天地不仁', '逆天改命', '永恒不朽'],
      hooks: ['神秘古尸', '禁忌存在', '万古布局'],
      personality: '想象力丰富，偏爱宏大叙事，善于挖掘深层内涵',
      bias: '情节推进较慢，需要耐心阅读'
    },
    {
      id: 'tiancan_tudou',
      name: '天蚕土豆',
      avatar: '⚡',
      specialties: ['异界大陆', '斗气修炼', '热血奋斗'],
      style: '节奏明快，战斗精彩，主角成长线清晰，易于阅读',
      masterworks: ['斗破苍穹', '武动乾坤', '大主宰'],
      coreIdeas: ['三十年河东三十年河西', '莫欺少年穷', '强者为尊'],
      hooks: ['退婚情节', '实力逆袭', '天才对决'],
      personality: '善于塑造励志剧情，重视读者阅读体验',
      bias: '套路相对固定，创新性有限'
    },
    {
      id: 'wo_chi_xihongshi',
      name: '我吃西红柿',
      avatar: '🍅',
      specialties: ['异世修炼', '虚拟游戏', '宇宙星空'],
      style: '世界观严密，逻辑清晰，力量体系完整，文风朴实',
      masterworks: ['盘龙', '星辰变', '吞噬星空', '九鼎记'],
      coreIdeas: ['持之以恒', '自我超越', '宇宙本源'],
      hooks: ['血脉传承', '神器认主', '位面征战'],
      personality: '严谨务实，重视世界观构建，擅长长篇规划',
      bias: '人物性格略显单薄，感情线较弱'
    },
    {
      id: 'fenghuo_xizhuhou',
      name: '烽火戏诸侯',
      avatar: '🗡️',
      specialties: ['武侠仙侠', '权谋争斗', '江湖恩怨'],
      style: '文笔犀利，人物鲜活，善于刻画复杂人性，意境深远',
      masterworks: ['雪中悍刀行', '剑来', '陈二狗的妖孽人生'],
      coreIdeas: ['快意恩仇', '家国情怀', '侠骨柔情'],
      hooks: ['江湖传说', '武学奥义', '恩怨情仇'],
      personality: '文学功底深厚，重视人物刻画和意境营造',
      bias: '更新不够稳定，对读者要求较高'
    },
    {
      id: 'mengru_shenji',
      name: '梦入神机',
      avatar: '🌀',
      specialties: ['玄幻修真', '武道巅峰', '哲学思辨'],
      style: '思想深邃，哲理性强，武道描写精彩，擅长融合各家思想',
      masterworks: ['佛本是道', '阳神', '永生'],
      coreIdeas: ['佛道双修', '武道至尊', '永恒不灭'],
      hooks: ['佛道之争', '武道真意', '超脱轮回'],
      personality: '哲学底蕴深厚，善于思辨，重视精神境界',
      bias: '文字较为晦涩，对读者文化要求较高'
    },
    {
      id: 'fenglingtianxia',
      name: '风凌天下',
      avatar: '💨',
      specialties: ['热血玄幻', '异界征战', '军人情怀'],
      style: '热血沸腾，文风豪放，善于描写战争场面，诗词功底深厚',
      masterworks: ['凌天传说', '傲世九重天', '天域苍穹'],
      coreIdeas: ['热血男儿', '保家卫国', '义薄云天'],
      hooks: ['异界征战', '兄弟情深', '诗词对决'],
      personality: '军人背景，文风豪迈，重视兄弟情义',
      bias: '情节有时过于热血，女性角色略显单薄'
    },
    {
      id: 'fangxiang',
      name: '方想',
      avatar: '🎨',
      specialties: ['创新玄幻', '体系构建', '想象力'],
      style: '想象力奇特，善于创新题材，每部作品都有独特设定',
      masterworks: ['修真世界', '师士传说', '卡徒'],
      coreIdeas: ['创新突破', '独特世界观', '精神意志'],
      hooks: ['新颖设定', '体系创新', '精神力量'],
      personality: '极富创造力，不拘泥于传统，敢于尝试新的写作模式',
      bias: '有时过于追求创新，可读性略有影响'
    },
    {
      id: 'xuehong',
      name: '血红',
      avatar: '🩸',
      specialties: ['黑暗玄幻', '升级流', '暴力美学'],
      style: '文风犀利，情节激烈，善于营造紧张氛围，战斗描写精彩',
      masterworks: ['升龙道', '巫颂', '神魔'],
      coreIdeas: ['实力为尊', '弱肉强食', '逆天而行'],
      hooks: ['血腥战斗', '等级提升', '复仇情节'],
      personality: '风格独特，敢于描写黑暗面，不拘束于传统道德框架',
      bias: '暴力元素较多，不适合低龄读者'
    },
    {
      id: 'aiqianshui_wuzei',
      name: '爱潜水的乌贼',
      avatar: '🐙',
      specialties: ['克苏鲁玄幻', '悬疑诡异', '西方元素'],
      style: '氛围营造出色，善于融合西方神秘学，文笔细腻',
      masterworks: ['诡秘之主', '奥术神座', '一世之尊'],
      coreIdeas: ['知识即力量', '探索未知', '理性与疯狂'],
      hooks: ['神秘学', '非凡能力', '诡异事件'],
      personality: '博学多才，善于融合东西方文化，重视细节描写',
      bias: '节奏偏慢，对读者文化素养要求较高'
    },
    {
      id: 'huishuohua_zhouzi',
      name: '会说话的肘子',
      avatar: '🗣️',
      specialties: ['轻松玄幻', '幽默搞笑', '另类升级'],
      style: '幽默风趣，脑洞大开，善于创造轻松愉快的阅读氛围',
      masterworks: ['大王饶命', '第一序列', '夜的命名术'],
      coreIdeas: ['搞笑人生', '另类成长', '轻松修炼'],
      hooks: ['搞笑情节', '奇葩设定', '意外反转'],
      personality: '幽默感十足，善于自嘲，重视娱乐性',
      bias: '过分追求搞笑效果，有时影响情节深度'
    },
    {
      id: 'zhainiu',
      name: '宅猪',
      avatar: '🐷',
      specialties: ['神话玄幻', '洪荒设定', '古风文化'],
      style: '文笔优美，善于描绘恢宏场面，对古代文化理解深刻',
      masterworks: ['牧神记', '人道至尊', '上古'],
      coreIdeas: ['神话传承', '文明进步', '人道光辉'],
      hooks: ['神话生物', '上古传说', '文明冲突'],
      personality: '文化底蕴深厚，重视传统文化传承',
      bias: '情节推进较慢，需要一定的文化基础'
    }
  ],

  // 修真类 - 以修仙、修真为主要题材
  cultivation: [
    {
      id: 'chen_dong',
      name: '辰东',
      avatar: '⭐',
      specialties: ['古典仙侠', '洪荒修仙', '玄幻'],
      style: '气势恢宏，想象奇诡，善于营造史诗氛围，文笔华丽',
      masterworks: ['遮天', '完美世界', '圣墟'],
      coreIdeas: ['天地不仁', '逆天改命', '永恒不朽'],
      hooks: ['神秘古尸', '禁忌存在', '万古布局'],
      personality: '想象力丰富，偏爱宏大叙事，善于挖掘深层内涵',
      bias: '情节推进较慢，需要耐心阅读'
    },
    {
      id: 'wo_chi_xihongshi',
      name: '我吃西红柿',
      avatar: '🍅',
      specialties: ['异世修炼', '修真体系', '宇宙星空'],
      style: '世界观严密，逻辑清晰，力量体系完整，文风朴实',
      masterworks: ['盘龙', '星辰变', '吞噬星空', '九鼎记'],
      coreIdeas: ['持之以恒', '自我超越', '宇宙本源'],
      hooks: ['血脉传承', '神器认主', '位面征战'],
      personality: '严谨务实，重视世界观构建，擅长长篇规划',
      bias: '人物性格略显单薄，感情线较弱'
    },
    {
      id: 'mengru_shenji',
      name: '梦入神机',
      avatar: '🌀',
      specialties: ['佛道修炼', '武道巅峰', '哲学思辨'],
      style: '思想深邃，哲理性强，武道描写精彩，擅长融合各家思想',
      masterworks: ['佛本是道', '阳神', '永生'],
      coreIdeas: ['佛道双修', '武道至尊', '永恒不灭'],
      hooks: ['佛道之争', '武道真意', '超脱轮回'],
      personality: '哲学底蕴深厚，善于思辨，重视精神境界',
      bias: '文字较为晦涩，对读者文化要求较高'
    },
    {
      id: 'ergen',
      name: '耳根',
      avatar: '👂',
      specialties: ['修真仙侠', '情感描写', '轮回转世'],
      style: '情感细腻，文笔优美，善于营造凄美氛围，人物鲜明',
      masterworks: ['仙逆', '求魔', '我欲封天', '一念永恒'],
      coreIdeas: ['逆天而行', '情深不悔', '我命由我'],
      hooks: ['逆天修炼', '红颜知己', '宿命纠缠'],
      personality: '重视情感表达，文笔细腻，擅长悲剧美学',
      bias: '情节节奏偏慢，虐心情节较多'
    }
  ],

  // 都市类 - 现代都市为背景
  urban: [
    {
      id: 'tangjia_sanshao',
      name: '唐家三少',
      avatar: '🏅',
      specialties: ['都市异能', '游戏竞技', '现代奇幻'],
      style: '更新稳定，情节紧凑，正能量满满，易于阅读',
      masterworks: ['斗罗大陆', '绝世唐门', '神印王座', '琴帝'],
      coreIdeas: ['友情第一', '永不放弃', '正义必胜'],
      hooks: ['天赋觉醒', '团队合作', '强者对决'],
      personality: '积极向上，善于营造温暖氛围，十多年从未断更',
      bias: '情节相对简单，深度略显不足'
    },
    {
      id: 'liu_xiahui',
      name: '刘下辉',
      avatar: '🕴️',
      specialties: ['都市生活', '职场商战', '轻松幽默'],
      style: '轻松幽默，贴近生活，人物形象鲜活，可读性强',
      masterworks: ['贴身保镖', '天才医生', '超级教师'],
      coreIdeas: ['平凡中的不平凡', '幽默面对生活', '正义与温情'],
      hooks: ['搞笑情节', '职场奋斗', '美女环绕'],
      personality: '幽默风趣，善于描写都市生活，重视人物互动',
      bias: '深度有限，主要以娱乐为主'
    },
    {
      id: 'zhude_chuyao',
      name: '猪德处药',
      avatar: '💊',
      specialties: ['都市医生', '医疗题材', '专业知识'],
      style: '专业严谨，情节紧张，医疗知识丰富，人性探讨深刻',
      masterworks: ['医道官途', '手术直播间', '大医凌然'],
      coreIdeas: ['医者仁心', '专业至上', '救死扶伤'],
      hooks: ['疑难杂症', '医患关系', '医学突破'],
      personality: '专业性强，善于将医学知识融入故事',
      bias: '专业术语较多，非医学背景读者可能较难理解'
    },
    {
      id: 'fenghuo_xizhuhou_urban',
      name: '烽火戏诸侯',
      avatar: '🏙️',
      specialties: ['都市青春', '校园生活', '青年成长'],
      style: '文笔细腻，情感真挚，青春感强烈，人物立体',
      masterworks: ['陈二狗的妖孽人生', '老子是癞蛤蟆'],
      coreIdeas: ['青春无悔', '成长蜕变', '真性情'],
      hooks: ['校园恋情', '兄弟情义', '青春叛逆'],
      personality: '对青春期心理把握准确，情感描写细腻',
      bias: '主要面向年轻读者，成人读者可能共鸣较少'
    },
    {
      id: 'changtian',
      name: '常天',
      avatar: '🚗',
      specialties: ['都市重生', '商业谋略', '人生规划'],
      style: '逻辑清晰，商业知识丰富，重生题材处理得当',
      masterworks: ['重生之官路商途', '重生之神级学霸'],
      coreIdeas: ['机遇与准备', '知识改变命运', '理性决策'],
      hooks: ['重生优势', '商业布局', '人脉建设'],
      personality: '理性务实，善于构建合理的重生剧情',
      bias: '过分强调金钱和地位，价值观相对单一'
    },
    {
      id: 'wo_shi_yu',
      name: '我是愚者',
      avatar: '🎭',
      specialties: ['都市异能', '超能力', '现代奇幻'],
      style: '想象力丰富，异能设定新颖，现代感强',
      masterworks: ['全能闲人', '超级学生'],
      coreIdeas: ['能力与责任', '隐于市井', '低调发展'],
      hooks: ['异能觉醒', '隐秘组织', '现代超能者'],
      personality: '善于将超自然元素与现代生活结合',
      bias: '异能设定有时过于理想化'
    },
    {
      id: 'laodu',
      name: '老杜',
      avatar: '👔',
      specialties: ['职场官场', '官员生涯', '权谋智斗'],
      style: '官场描写真实，人物关系复杂，政治智慧丰富',
      masterworks: ['官场新秀', '仕途'],
      coreIdeas: ['为官之道', '民生为本', '权责统一'],
      hooks: ['官场升迁', '权力斗争', '民生项目'],
      personality: '对官场生态理解深刻，现实感强',
      bias: '政治色彩较重，娱乐性相对较弱'
    },
    {
      id: 'xiaobailong',
      name: '小白龙',
      avatar: '🐲',
      specialties: ['都市修仙', '现代修炼', '隐秘世界'],
      style: '传统与现代结合，修炼体系完整，世界观独特',
      masterworks: ['都市修仙', '现代修仙录'],
      coreIdeas: ['修炼不辍', '入世修行', '传统传承'],
      hooks: ['隐藏高手', '修炼门派', '现代修仙者'],
      personality: '善于将传统修仙元素融入现代背景',
      bias: '修仙元素与现代背景有时显得突兀'
    },
    {
      id: 'xiqing',
      name: '席青',
      avatar: '🎸',
      specialties: ['都市娱乐', '音乐创作', '明星生活'],
      style: '娱乐圈描写真实，音乐元素丰富，明星心路历程细腻',
      masterworks: ['天王', '重生之娱乐至尊'],
      coreIdeas: ['艺术追求', '娱乐为民', '正能量传播'],
      hooks: ['音乐创作', '娱乐圈内幕', '明星成长'],
      personality: '对娱乐行业了解深入，艺术修养较高',
      bias: '过分美化娱乐圈，与现实存在差距'
    },
    {
      id: 'wannian_dashu',
      name: '万年大树',
      avatar: '🌳',
      specialties: ['都市系统', '数据面板', '游戏元素'],
      style: '系统设定新颖，升级路线清晰，游戏感强',
      masterworks: ['都市之系统大抽奖', '超级抽奖系统'],
      coreIdeas: ['系统辅助', '努力奋斗', '能力提升'],
      hooks: ['系统奖励', '任务完成', '能力抽奖'],
      personality: '善于设计有趣的系统规则和奖励机制',
      bias: '过分依赖系统设定，人物主观能动性较弱'
    },
    {
      id: 'nanwang_beichao',
      name: '南望北朝',
      avatar: '🌅',
      specialties: ['都市情感', '爱情婚姻', '家庭生活'],
      style: '情感描写细腻，生活气息浓厚，女性角色塑造出色',
      masterworks: ['都市之活色生香', '重生完美时代'],
      coreIdeas: ['真爱至上', '家庭和睦', '情感真挚'],
      hooks: ['都市爱情', '婚姻危机', '情感纠葛'],
      personality: '对现代都市情感生活观察敏锐',
      bias: '情感线有时过于理想化'
    },
    {
      id: 'zhangjun',
      name: '张君',
      avatar: '💼',
      specialties: ['商战谋略', '企业经营', '财富积累'],
      style: '商业逻辑清晰，市场分析准确，商战描写精彩',
      masterworks: ['重生之商业大亨', '都市商战'],
      coreIdeas: ['商道智慧', '诚信经营', '互利共赢'],
      hooks: ['商业竞争', '企业并购', '市场博弈'],
      personality: '商业嗅觉敏锐，对市场经济理解深刻',
      bias: '过分注重商业成功，忽略人文关怀'
    }
  ],

  // 历史类 - 历史题材小说
  history: [
    {
      id: 'jiutu',
      name: '酒徒',
      avatar: '🍶',
      specialties: ['历史军事', '架空历史', '民族情怀'],
      style: '史学功底深厚，文笔厚重，善于展现历史的沧桑感',
      masterworks: ['明', '秦', '隋乱', '男儿行'],
      coreIdeas: ['家国情怀', '民族复兴', '历史传承'],
      hooks: ['历史转折', '英雄人物', '民族大义'],
      personality: '史学修养深厚，爱国情怀浓郁，文风庄重',
      bias: '更新速度较慢，对历史知识要求较高'
    },
    {
      id: 'yueguan',
      name: '月关',
      avatar: '🌙',
      specialties: ['穿越历史', '官场争斗', '历史演义'],
      style: '情节跌宕，人物丰满，历史知识丰富，可读性强',
      masterworks: ['回到明朝当王爷', '夜天子', '锦衣夜行'],
      coreIdeas: ['穿越改变历史', '智慧胜过武力', '家国天下'],
      hooks: ['穿越身份', '官场智斗', '历史名人'],
      personality: '博学多才，善于将历史与娱乐结合',
      bias: '有时为了娱乐性牺牲历史真实性'
    },
    {
      id: 'huangyi',
      name: '黄易',
      avatar: '⚔️',
      specialties: ['历史武侠', '春秋战国', '奇幻历史'],
      style: '想象力奇特，历史与奇幻结合，武打描写精彩',
      masterworks: ['寻秦记', '大唐双龙传', '破碎虚空'],
      coreIdeas: ['历史与幻想', '武道追求', '时空穿梭'],
      hooks: ['穿越历史', '历史名人', '武功绝学'],
      personality: '历史武侠融合的开创者，想象力丰富',
      bias: '历史真实性与幻想元素平衡较难把握'
    },
    {
      id: 'xiaoyao_xinxin',
      name: '逍遥心心',
      avatar: '🏛️',
      specialties: ['三国题材', '历史架空', '权谋争斗'],
      style: '三国背景熟悉，权谋描写精彩，人物性格鲜明',
      masterworks: ['重生在三国', '三国之召唤猛将'],
      coreIdeas: ['智勇并重', '忠义为先', '统一天下'],
      hooks: ['三国乱世', '英雄汇聚', '王者之路'],
      personality: '对三国历史了解深入，善于权谋描写',
      bias: '题材相对固定，创新性有限'
    },
    {
      id: 'huiben_guiqu',
      name: '灰本鬼区',
      avatar: '👑',
      specialties: ['明清历史', '宫廷争斗', '历史悬疑'],
      style: '宫廷描写细腻，悬疑氛围浓厚，历史细节丰富',
      masterworks: ['明朝那些事儿', '清宫秘史'],
      coreIdeas: ['权力游戏', '宫廷秘闻', '历史真相'],
      hooks: ['宫廷斗争', '皇权争夺', '历史谜团'],
      personality: '对明清历史研究深入，擅长宫廷题材',
      bias: '过分渲染宫廷斗争，正面价值观相对较少'
    },
    {
      id: 'gaoyue',
      name: '高月',
      avatar: '🗡️',
      specialties: ['秦汉历史', '武侠历史', '英雄传奇'],
      style: '历史厚重感强，武侠元素丰富，英雄形象鲜明',
      masterworks: ['秦时明月', '天行九歌'],
      coreIdeas: ['侠者精神', '历史传承', '正义之道'],
      hooks: ['历史英雄', '江湖恩怨', '家国大义'],
      personality: '擅长将武侠元素融入历史背景',
      bias: '武侠色彩较重，历史真实性有所牺牲'
    },
    {
      id: 'xiangnan',
      name: '湘南',
      avatar: '🏮',
      specialties: ['汉唐历史', '盛世描写', '文化传承'],
      style: '文化底蕴深厚，盛世气象恢宏，传统文化表现突出',
      masterworks: ['大汉帝国风云录', '盛唐风华'],
      coreIdeas: ['文化自信', '盛世气象', '传统传承'],
      hooks: ['盛世繁华', '文化交流', '民族融合'],
      personality: '对汉唐文化理解深刻，文史功底扎实',
      bias: '过分美化历史，现实感稍显不足'
    },
    {
      id: 'gengxin',
      name: '庚新',
      avatar: '📜',
      specialties: ['近代历史', '革命题材', '民族觉醒'],
      style: '近代史背景丰富，革命精神突出，爱国情怀浓烈',
      masterworks: ['辛亥革命', '抗战风云'],
      coreIdeas: ['民族独立', '革命精神', '爱国主义'],
      hooks: ['革命斗争', '民族觉醒', '救国图强'],
      personality: '对近代史了解深入，革命情怀强烈',
      bias: '政治色彩较重，娱乐性相对较弱'
    },
    {
      id: 'qingshan_tiexue',
      name: '青山铁血',
      avatar: '⚔️',
      specialties: ['军事历史', '战争题材', '英雄史诗'],
      style: '军事描写专业，战争场面宏大，英雄形象突出',
      masterworks: ['抗日铁血军魂', '解放战争风云'],
      coreIdeas: ['军人荣誉', '保家卫国', '铁血精神'],
      hooks: ['战争场面', '军事战术', '英雄事迹'],
      personality: '军事知识丰富，战争描写专业',
      bias: '过分强调战争，和平价值观表现不足'
    },
    {
      id: 'wangpai',
      name: '王牌',
      avatar: '🎖️',
      specialties: ['春秋战国', '诸侯争霸', '政治谋略'],
      style: '春秋战国历史熟悉，政治谋略精彩，人物智慧突出',
      masterworks: ['战国策', '春秋霸主'],
      coreIdeas: ['智者生存', '政治智慧', '诸侯争霸'],
      hooks: ['政治联盟', '外交谋略', '霸主争夺'],
      personality: '对先秦政治制度理解深刻',
      bias: '谋略性过强，情感色彩相对较少'
    },
    {
      id: 'shangshan_ruoshui',
      name: '上善若水',
      avatar: '💧',
      specialties: ['古代文化', '传统哲学', '文人历史'],
      style: '文化气息浓厚，哲学思辨深刻，文人情怀突出',
      masterworks: ['儒道之争', '文人风骨'],
      coreIdeas: ['文化传承', '哲学思辨', '文人精神'],
      hooks: ['文化交流', '哲学辩论', '文人生活'],
      personality: '文史哲功底深厚，传统文化修养高',
      bias: '过于文雅，缺乏通俗性'
    },
    {
      id: 'tiexue_daming',
      name: '铁血大明',
      avatar: '🏰',
      specialties: ['明朝历史', '帝王将相', '朝政军事'],
      style: '明朝历史细节丰富，帝王心术描写精彩',
      masterworks: ['大明王朝', '永乐大帝'],
      coreIdeas: ['帝王之道', '中央集权', '国家统一'],
      hooks: ['皇权斗争', '朝政改革', '对外征战'],
      personality: '对明朝政治制度研究深入',
      bias: '过分强调皇权，民主思想较少'
    }
  ],

  // 科幻类 - 科幻题材  
  scifi: [
    {
      id: 'wo_chi_xihongshi_scifi',
      name: '我吃西红柿',
      avatar: '🚀',
      specialties: ['虚拟现实', '星际文明', '科技修炼'],
      style: '世界观严密，逻辑清晰，力量体系完整，文风朴实',
      masterworks: ['吞噬星空', '莽荒纪', '雪鹰领主'],
      coreIdeas: ['科技与修炼并重', '宇宙探索', '文明演进'],
      hooks: ['星际战争', '虚拟世界', '科技突破'],
      personality: '严谨务实，重视世界观构建，擅长长篇规划',
      bias: '科幻元素与玄幻结合，不够纯粹'
    },
    {
      id: 'liuxixin',
      name: '刘慈欣',
      avatar: '🌌',
      specialties: ['硬科幻', '宇宙文明', '科学思辨'],
      style: '科学基础扎实，想象力宏大，哲学思辨深刻',
      masterworks: ['三体', '球状闪电', '流浪地球'],
      coreIdeas: ['科学理性', '文明进化', '宇宙思维'],
      hooks: ['外星文明', '科学发现', '人类命运'],
      personality: '科学素养深厚，宇宙观宏大',
      bias: '偏重科学逻辑，情感描写相对较弱'
    },
    {
      id: 'zhengzhengge',
      name: '征程哥',
      avatar: '🛸',
      specialties: ['星际战争', '机甲战斗', '军事科幻'],
      style: '战斗场面激烈，机甲设定详细，军事色彩浓厚',
      masterworks: ['星际战甲', '机甲世界'],
      coreIdeas: ['科技强军', '战斗荣誉', '保卫家园'],
      hooks: ['机甲对战', '星际征战', '科技武器'],
      personality: '军事科幻专家，战斗描写专业',
      bias: '战争色彩过重，和平思想相对缺乏'
    },
    {
      id: 'changgong',
      name: '长弓',
      avatar: '🎯',
      specialties: ['末世科幻', '生存题材', '人性考验'],
      style: '末世氛围营造出色，生存描写真实，人性刻画深刻',
      masterworks: ['末世重生', '废土生存'],
      coreIdeas: ['生存第一', '人性光辉', '希望重建'],
      hooks: ['末世求生', '变异生物', '重建家园'],
      personality: '擅长描写极端环境下的人性',
      bias: '过分渲染末世恐惧，正能量相对不足'
    },
    {
      id: 'tianwai_feiyu',
      name: '天外飞鱼',
      avatar: '🐟',
      specialties: ['太空歌剧', '星系政治', '外交谈判'],
      style: '宇宙政治复杂，外交描写精彩，星际文明多样',
      masterworks: ['星河帝国', '银河联邦'],
      coreIdeas: ['文明对话', '宇宙和平', '多元共存'],
      hooks: ['星际外交', '文明冲突', '宇宙政治'],
      personality: '对宇宙政治有独特见解',
      bias: '政治色彩较重，冒险元素相对较少'
    },
    {
      id: 'jixie_shifu',
      name: '机械师父',
      avatar: '🤖',
      specialties: ['人工智能', '机器人', '科技伦理'],
      style: 'AI描写专业，科技伦理思考深入，逻辑严密',
      masterworks: ['机械帝国', '智能觉醒'],
      coreIdeas: ['科技伦理', '人机共存', '智能进化'],
      hooks: ['AI觉醒', '机器人革命', '技术奇点'],
      personality: '对人工智能技术理解深刻',
      bias: '技术描述过于专业，一般读者理解困难'
    },
    {
      id: 'shikong_langke',
      name: '时空浪客',
      avatar: '⏰',
      specialties: ['时间旅行', '平行宇宙', '时空悖论'],
      style: '时空设定严密，悖论处理巧妙，逻辑思维强',
      masterworks: ['时空旅者', '平行世界'],
      coreIdeas: ['时空探索', '因果循环', '命运改变'],
      hooks: ['时间悖论', '平行自己', '历史改变'],
      personality: '时空理论研究深入，逻辑思维强',
      bias: '理论性过强，情节推进相对较慢'
    },
    {
      id: 'xingchen_zhiyi',
      name: '星辰之翼',
      avatar: '⭐',
      specialties: ['星际探索', '太空冒险', '新世界发现'],
      style: '探索精神突出，冒险情节丰富，新世界描写精彩',
      masterworks: ['星海探索者', '新大陆'],
      coreIdeas: ['探索未知', '勇气冒险', '发现新世界'],
      hooks: ['星际探索', '未知星球', '新物种发现'],
      personality: '充满探索精神，想象力丰富',
      bias: '过分强调冒险，科学严谨性有所不足'
    },
    {
      id: 'lizi_daodi',
      name: '粒子倒地',
      avatar: '⚛️',
      specialties: ['量子物理', '微观世界', '粒子科幻'],
      style: '量子物理知识丰富，微观描写独特，科学基础扎实',
      masterworks: ['量子世界', '粒子风暴'],
      coreIdeas: ['量子理论', '微观宇宙', '粒子文明'],
      hooks: ['量子纠缠', '微观生命', '粒子风暴'],
      personality: '物理学功底深厚，微观想象独特',
      bias: '物理概念过于专业，普通读者理解困难'
    },
    {
      id: 'saibeike',
      name: '赛博客',
      avatar: '💻',
      specialties: ['赛博朋克', '虚拟现实', '网络世界'],
      style: '赛博朋克风格突出，虚拟世界构建精彩，科技感强',
      masterworks: ['数字王国', '虚拟现实'],
      coreIdeas: ['数字生存', '虚拟与现实', '网络自由'],
      hooks: ['黑客技术', '虚拟世界', '数字身份'],
      personality: '对网络文化理解深刻，科技感强',
      bias: '过分强调虚拟世界，现实关怀相对不足'
    },
    {
      id: 'weicheng_zhilu',
      name: '未成之路',
      avatar: '🛤️',
      specialties: ['软科幻', '社会科幻', '人文关怀'],
      style: '人文关怀突出，社会思考深入，科幻元素适中',
      masterworks: ['未来社会', '科技与人'],
      coreIdeas: ['人文关怀', '社会进步', '科技向善'],
      hooks: ['社会变革', '人文思考', '科技伦理'],
      personality: '注重人文价值，社会责任感强',
      bias: '科幻色彩相对较淡，硬科幻爱好者可能不满足'
    },
    {
      id: 'yinhuan_zhanlang',
      name: '银环战狼',
      avatar: '🐺',
      specialties: ['军事科幻', '未来战争', '战术革新'],
      style: '军事科幻专业，未来战争描写精彩，战术思维先进',
      masterworks: ['未来战争', '银河战队'],
      coreIdeas: ['科技强军', '战术革新', '军人荣誉'],
      hooks: ['未来武器', '太空战争', '军事科技'],
      personality: '军事科技知识丰富，战争场面专业',
      bias: '军事色彩过重，和平主义色彩不足'
    }
  ],

  // 言情类 - 基于真实排行榜获奖作者
  romance: [
    {
      id: 'ding_mo',
      name: '丁墨',
      avatar: '💕',
      specialties: ['现代言情', '悬疑言情', '职场恋情'],
      style: '情感细腻，情节紧凑，善于营造浪漫氛围',
      masterworks: ['他来了请闭眼', '挚野', '你和我的倾城时光'],
      coreIdeas: ['爱情至上', '成长蜕变', '温暖治愈'],
      hooks: ['霸道总裁', '悬疑探案', '青梅竹马'],
      personality: '女性视角细腻，善于描写情感变化',
      bias: '主要面向女性读者，男性视角较少'
    },
    {
      id: 'gu_man',
      name: '顾漫',
      avatar: '🌸',
      specialties: ['校园言情', '都市言情', '甜宠文'],
      style: '文风清新，情节甜腻，人物可爱，治愈系强',
      masterworks: ['何以笙箫默', '微微一笑很倾城', '杉杉来了'],
      coreIdeas: ['纯真爱情', '青春美好', '温暖治愈'],
      hooks: ['校园恋情', '网游恋爱', '职场浪漫'],
      personality: '善于营造甜腻氛围，治愈系风格',
      bias: '情节相对简单，深度略显不足'
    },
    {
      id: 'tong_hua',
      name: '桐华',
      avatar: '🌺',
      specialties: ['古装言情', '穿越言情', '虐恋情深'],
      style: '古代背景深厚，情感虐心，文笔优美，历史感强',
      masterworks: ['步步惊心', '长相思', '大漠谣'],
      coreIdeas: ['命运多舛', '情深不悔', '历史洪流'],
      hooks: ['宫廷恋情', '穿越历史', '虐恋情深'],
      personality: '古代文化功底深厚，情感描写细腻',
      bias: '虐心情节较多，不适合喜欢轻松风格的读者'
    },
    {
      id: 'fei_wo_sicun',
      name: '匪我思存',
      avatar: '💔',
      specialties: ['虐恋言情', '现代豪门', '情感纠葛'],
      style: '虐恋情深，情感浓烈，善于刻画复杂情感关系',
      masterworks: ['佳期如梦', '千山暮雪', '东宫'],
      coreIdeas: ['爱恨交织', '命运捉弄', '情深不悔'],
      hooks: ['虐恋情深', '豪门恩怨', '命运纠缠'],
      personality: '擅长虐恋题材，情感描写浓烈',
      bias: '虐心程度较高，心理承受能力弱的读者慎入'
    },
    {
      id: 'xian_mao',
      name: '鲜猫',
      avatar: '🐱',
      specialties: ['甜宠言情', '现代言情', '轻松幽默'],
      style: '甜宠风格，轻松幽默，人物互动有趣，阅读体验愉快',
      masterworks: ['夏有乔木', '北城以北'],
      coreIdeas: ['甜蜜恋爱', '轻松愉快', '治愈系'],
      hooks: ['甜蜜日常', '霸道总裁', '青梅竹马'],
      personality: '甜宠系作者，善于营造轻松氛围',
      bias: '情节相对简单，缺乏深度冲突'
    },
    {
      id: 'qing_shan_luo_shan',
      name: '青衫落拓',
      avatar: '🍃',
      specialties: ['古风言情', '仙侠言情', '古代修仙'],
      style: '古风浓郁，仙侠背景丰富，情感与修仙并重',
      masterworks: ['花千骨', '香蜜沉沉烬如霜'],
      coreIdeas: ['仙凡恋情', '修仙成长', '爱情超越'],
      hooks: ['师徒恋', '仙凡虐恋', '修仙成长'],
      personality: '古风文化修养深厚，仙侠言情专家',
      bias: '仙侠背景可能对现代读者有门槛'
    },
    {
      id: 'ming_yue_ting_feng',
      name: '明月听风',
      avatar: '🌙',
      specialties: ['穿越言情', '宫廷言情', '权谋爱情'],
      style: '宫廷背景丰富，权谋与爱情并重，人物关系复杂',
      masterworks: ['凤囚凰', '美人为馅'],
      coreIdeas: ['权谋与爱情', '宫廷斗争', '智勇双全'],
      hooks: ['宫廷权谋', '穿越重生', '帝王之恋'],
      personality: '对古代宫廷制度理解深刻',
      bias: '权谋色彩较重，纯爱读者可能不适应'
    },
    {
      id: 'wu_zhe',
      name: '巫哲',
      avatar: '🔮',
      specialties: ['现代言情', '情感治愈', '现实题材'],
      style: '情感真实，贴近生活，治愈系强，人物立体',
      masterworks: ['撒野', '某某'],
      coreIdeas: ['治愈成长', '真实情感', '温暖人心'],
      hooks: ['校园生活', '成长蜕变', '治愈情感'],
      personality: '善于描写真实情感，治愈系风格',
      bias: '更新速度相对较慢'
    },
    {
      id: 'priest',
      name: 'Priest',
      avatar: '⛪',
      specialties: ['悬疑言情', '科幻言情', '复杂设定'],
      style: '设定复杂，逻辑严密，悬疑元素丰富，文笔精练',
      masterworks: ['镇魂', '默读', '有匪'],
      coreIdeas: ['正义信念', '复杂人性', '悬疑解谜'],
      hooks: ['悬疑推理', '特殊职业', '复杂背景'],
      personality: '逻辑思维强，善于构建复杂世界观',
      bias: '设定复杂，对读者理解能力要求较高'
    },
    {
      id: 'chang_an_shierjie',
      name: '长安十二街',
      avatar: '🏮',
      specialties: ['古风言情', '武侠言情', '江湖情缘'],
      style: '古风浓郁，武侠背景丰富，江湖气息浓厚',
      masterworks: ['侠客行', '江湖路'],
      coreIdeas: ['江湖恩怨', '侠客精神', '儿女情长'],
      hooks: ['武侠背景', '江湖恩怨', '侠侣情深'],
      personality: '武侠文化功底深厚，古风韵味浓',
      bias: '武侠背景对现代读者可能有门槛'
    },
    {
      id: 'wei_feng_yu',
      name: '微风细雨',
      avatar: '🌧️',
      specialties: ['现代都市', '职场言情', '成熟爱情'],
      style: '都市背景真实，职场描写专业，成熟爱情观',
      masterworks: ['遇见你之后', '都市爱情'],
      coreIdeas: ['成熟爱情', '职场成长', '都市生活'],
      hooks: ['职场恋情', '都市生活', '成熟关系'],
      personality: '对都市职场生活观察敏锐',
      bias: '主要面向成年读者，年轻读者共鸣可能较少'
    },
    {
      id: 'mo_bao_fei_bao',
      name: '墨宝非宝',
      avatar: '📚',
      specialties: ['现代言情', '暖文治愈', '青春校园'],
      style: '温暖治愈，青春气息浓厚，情感描写细腻',
      masterworks: ['至此终年', '蜜汁炖鱿鱼'],
      coreIdeas: ['温暖治愈', '青春美好', '简单纯真'],
      hooks: ['校园恋情', '温馨日常', '治愈系'],
      personality: '治愈系作者，善于营造温暖氛围',
      bias: '情节相对简单，喜欢复杂剧情的读者可能觉得单调'
    }
  ],

  // 网游类 - 虚拟游戏题材
  gaming: [
    {
      id: 'hudie_lan',
      name: '蝴蝶蓝',
      avatar: '🦋',
      specialties: ['电子竞技', '网络游戏', '职业选手'],
      style: '专业性强，热血燃情，对游戏理解深刻，人物塑造精彩',
      masterworks: ['全职高手', '网游之近战法师'],
      coreIdeas: ['永不言弃', '团队精神', '职业精神'],
      hooks: ['电竞比赛', '战术配合', '复仇归来'],
      personality: '对游戏有深入了解，善于描写竞技精神',
      bias: '题材相对单一，主要集中在电竞领域'
    },
    {
      id: 'shi_luo',
      name: '失落叶',
      avatar: '🍂',
      specialties: ['虚拟网游', '游戏系统', '升级打怪'],
      style: '游戏设定详细，升级体系完整，战斗描写精彩',
      masterworks: ['网游之天谴修罗', '重生之网游大亨'],
      coreIdeas: ['实力为尊', '团队合作', '游戏人生'],
      hooks: ['虚拟世界', '游戏任务', 'PK竞技'],
      personality: '对网游机制理解深刻，设定能力强',
      bias: '过分强调游戏性，现实感相对不足'
    },
    {
      id: 'wang_buxiu',
      name: '网不休',
      avatar: '💻',
      specialties: ['网游竞技', 'MOBA游戏', '团队作战'],
      style: '团队合作突出，战术描写专业，竞技氛围浓厚',
      masterworks: ['英雄联盟之决胜巅峰', 'DOTA之传奇人生'],
      coreIdeas: ['团队至上', '战术配合', '永不放弃'],
      hooks: ['团队竞技', '战术布局', '逆风翻盘'],
      personality: '对MOBA游戏理解专业，团队意识强',
      bias: '专业性较强，非游戏玩家理解门槛较高'
    },
    {
      id: 'fengshen_jiehuan',
      name: '风神劫环',
      avatar: '🌪️',
      specialties: ['网游修仙', '虚拟修炼', '游戏与现实'],
      style: '修仙与游戏结合，设定新颖，升级路线清晰',
      masterworks: ['网游之修仙传说', '虚拟修真界'],
      coreIdeas: ['游戏修仙', '虚实结合', '超越极限'],
      hooks: ['虚拟修仙', '现实影响', '修炼升级'],
      personality: '善于将修仙元素融入网游背景',
      bias: '修仙与游戏结合可能显得不协调'
    },
    {
      id: 'yizai_hongchen',
      name: '一载红尘',
      avatar: '🌹',
      specialties: ['网游言情', '游戏爱情', '虚拟恋情'],
      style: '游戏与爱情并重，情感描写细腻，游戏背景丰富',
      masterworks: ['网游之爱情公寓', '虚拟爱恋'],
      coreIdeas: ['虚拟恋情', '游戏人生', '真情流露'],
      hooks: ['网恋情缘', '游戏竞技', '现实相遇'],
      personality: '善于描写游戏中的情感关系',
      bias: '过分强调恋爱元素，游戏性相对较弱'
    },
    {
      id: 'youxi_wang',
      name: '游戏王',
      avatar: '👑',
      specialties: ['卡牌游戏', '策略竞技', '收集养成'],
      style: '卡牌机制详细，策略性强，收集要素丰富',
      masterworks: ['王者卡牌', '策略大师'],
      coreIdeas: ['策略制胜', '收集乐趣', '智慧竞技'],
      hooks: ['卡牌对战', '策略布局', '收集养成'],
      personality: '对卡牌游戏机制理解深刻',
      bias: '卡牌游戏相对小众，受众有限'
    },
    {
      id: 'dianzi_jingji',
      name: '电子竞技',
      avatar: '⚡',
      specialties: ['FPS游戏', '射击竞技', '反应速度'],
      style: 'FPS描写专业，反应速度突出，竞技性强',
      masterworks: ['CS传奇', '射击之王'],
      coreIdeas: ['精准射击', '反应敏捷', '团队配合'],
      hooks: ['精准射击', '反应对决', '团队战术'],
      personality: 'FPS游戏专家，反应能力突出',
      bias: '射击游戏相对暴力，不适合所有读者'
    },
    {
      id: 'shouyou_shidai',
      name: '手游时代',
      avatar: '📱',
      specialties: ['手机游戏', '休闲竞技', '碎片时间'],
      style: '手游特色突出，休闲性强，适合碎片阅读',
      masterworks: ['王者荣耀之巅峰王者', '手游大亨'],
      coreIdeas: ['休闲竞技', '碎片娱乐', '移动游戏'],
      hooks: ['手游竞技', '休闲娱乐', '移动端游戏'],
      personality: '对手游发展趋势把握准确',
      bias: '手游相对简单，深度玩家可能不满足'
    },
    {
      id: 'vrshijie',
      name: 'VR世界',
      avatar: '🥽',
      specialties: ['VR游戏', '虚拟现实', '沉浸体验'],
      style: 'VR技术前沿，沉浸感强，未来感突出',
      masterworks: ['VR新世界', '虚拟现实时代'],
      coreIdeas: ['虚拟现实', '沉浸体验', '技术革新'],
      hooks: ['VR技术', '虚拟体验', '现实交互'],
      personality: '对VR技术发展有前瞻性认识',
      bias: 'VR技术还不够成熟，现实感不足'
    },
    {
      id: 'wangluo_xiaoshuo',
      name: '网络小说',
      avatar: '📖',
      specialties: ['网文游戏', '文字游戏', '创作竞技'],
      style: '网文创作游戏化，文字竞技有趣，创意新颖',
      masterworks: ['网文之王', '创作大师'],
      coreIdeas: ['文字游戏', '创作竞技', '网文发展'],
      hooks: ['创作比赛', '文字竞技', '网文系统'],
      personality: '对网文行业发展有深刻理解',
      bias: '过于meta，可能让读者出戏'
    },
    {
      id: 'zuqiu_jingli',
      name: '足球经理',
      avatar: '⚽',
      specialties: ['体育游戏', '足球管理', '战术安排'],
      style: '足球知识丰富，战术描写专业，管理要素突出',
      masterworks: ['足球经理传奇', '绿茵王者'],
      coreIdeas: ['足球战术', '团队管理', '竞技精神'],
      hooks: ['足球比赛', '战术安排', '球员管理'],
      personality: '足球知识丰富，管理能力强',
      bias: '足球专业性较强，非球迷理解困难'
    },
    {
      id: 'moni_jingying',
      name: '模拟经营',
      avatar: '🏢',
      specialties: ['经营游戏', '模拟管理', '商业策略'],
      style: '经营管理详细，商业策略丰富，模拟要素完整',
      masterworks: ['模拟人生', '商业大亨'],
      coreIdeas: ['经营管理', '商业策略', '模拟体验'],
      hooks: ['商业经营', '管理决策', '模拟体验'],
      personality: '商业经营知识丰富，管理思维强',
      bias: '过分强调经营，冒险元素相对较少'
    }
  ],

  // 现实类 - 现实题材
  reality: [
    {
      id: 'he_changzai',
      name: '何常在',
      avatar: '🏭',
      specialties: ['现实题材', '改革开放', '商业奋斗'],
      style: '贴近现实，反映时代，人物形象真实，社会意义深刻',
      masterworks: ['浩荡', '官路', '官途'],
      coreIdeas: ['时代变迁', '个人奋斗', '社会进步'],
      hooks: ['商海沉浮', '官场百态', '时代机遇'],
      personality: '关注现实，善于反映社会变迁，正能量突出',
      bias: '娱乐性相对较弱，更注重社会价值'
    },
    {
      id: 'zhuo_muxian',
      name: '卓牧闲',
      avatar: '👮',
      specialties: ['公安题材', '社会现实', '基层生活'],
      style: '真实细腻，贴近生活，反映基层警察工作实际',
      masterworks: ['朝阳警事', '朝阳群众'],
      coreIdeas: ['服务人民', '维护正义', '基层奉献'],
      hooks: ['破案过程', '群众工作', '警民关系'],
      personality: '有基层工作经验，描写真实可信',
      bias: '题材相对专业，受众有限'
    }
  ],

  // 仙侠类
  xianxia: [
    {
      id: 'mao_ni',
      name: '猫腻',
      avatar: '🐱',
      specialties: ['古典仙侠', '人文情怀', '哲理思辨'],
      style: '文笔优美，意境深远，人物丰满，哲理性强',
      masterworks: ['将夜', '择天记', '庆余年'],
      coreIdeas: ['人定胜天', '温情守护', '成长蜕变'],
      hooks: ['师徒情深', '逆天修炼', '守护所爱'],
      personality: '文学功底深厚，重视人文关怀，文艺气息浓厚',
      bias: '节奏偏慢，对读者文学素养要求较高'
    },
    {
      id: 'fenghuo_xizhuhou_xianxia',
      name: '烽火戏诸侯',
      avatar: '🗡️',
      specialties: ['武侠仙侠', '权谋争斗', '江湖恩怨'],
      style: '文笔犀利，人物鲜活，善于刻画复杂人性，意境深远',
      masterworks: ['雪中悍刀行', '剑来'],
      coreIdeas: ['快意恩仇', '家国情怀', '侠骨柔情'],
      hooks: ['江湖传说', '武学奥义', '恩怨情仇'],
      personality: '文学功底深厚，重视人物刻画和意境营造',
      bias: '更新不够稳定，对读者要求较高'
    }
  ],

  // 悬疑类 - 推理悬疑题材
  mystery: [
    {
      id: 'zijin_chen',
      name: '紫金陈',
      avatar: '🔍',
      specialties: ['推理悬疑', '犯罪心理', '社会推理'],
      style: '逻辑严密，心理描写深刻，社会现实感强',
      masterworks: ['无证之罪', '坏小孩', '长夜难明'],
      coreIdeas: ['正义与邪恶', '人性复杂', '社会真相'],
      hooks: ['犯罪推理', '心理分析', '社会问题'],
      personality: '逻辑思维强，对社会现象观察敏锐',
      bias: '内容相对沉重，需要一定的心理承受能力'
    },
    {
      id: 'liu_cixin_mystery',
      name: '刘慈欣',
      avatar: '🌌',
      specialties: ['科幻悬疑', '宇宙谜团', '科学推理'],
      style: '科学基础扎实，逻辑严密，想象力宏大',
      masterworks: ['三体', '球状闪电'],
      coreIdeas: ['科学真理', '宇宙奥秘', '理性思维'],
      hooks: ['科学谜团', '宇宙文明', '技术悬疑'],
      personality: '科学素养深厚，理性思维强',
      bias: '科学门槛较高，文科读者可能理解困难'
    }
  ],

  // 武侠类 - 传统武侠题材
  wuxia: [
    {
      id: 'fenghuo_xizhuhou_wuxia',
      name: '烽火戏诸侯',
      avatar: '⚔️',
      specialties: ['新派武侠', '江湖恩怨', '侠义精神'],
      style: '文笔犀利，武侠韵味浓厚，人物性格鲜明',
      masterworks: ['雪中悍刀行', '剑来'],
      coreIdeas: ['侠者精神', '江湖道义', '快意恩仇'],
      hooks: ['武林秘籍', '江湖恩怨', '侠客精神'],
      personality: '新派武侠代表，文学功底深厚',
      bias: '对传统文化要求较高'
    }
  ],

  // 校园类 - 校园生活题材
  school: [
    {
      id: 'guo_jingming',
      name: '郭敬明',
      avatar: '🎓',
      specialties: ['青春校园', '情感描写', '时尚元素'],
      style: '青春气息浓厚，情感细腻，时尚感强',
      masterworks: ['小时代', '悲伤逆流成河'],
      coreIdeas: ['青春友谊', '成长烦恼', '时尚生活'],
      hooks: ['校园生活', '青春友谊', '情感纠葛'],
      personality: '对青春文化把握准确，时尚嗅觉敏锐',
      bias: '过分强调物质，价值观存在争议'
    }
  ],

  // 娱乐圈类 - 娱乐圈题材
  entertainment: [
    {
      id: 'xiqing_entertainment',
      name: '席青',
      avatar: '🎬',
      specialties: ['娱乐圈', '明星生活', '音乐创作'],
      style: '娱乐圈背景真实，明星心路历程细腻',
      masterworks: ['天王', '重生之娱乐至尊'],
      coreIdeas: ['艺术追求', '明星成长', '娱乐产业'],
      hooks: ['明星生活', '娱乐圈内幕', '艺术创作'],
      personality: '对娱乐行业了解深入',
      bias: '过分美化娱乐圈现实'
    }
  ],

  // 重生类 - 重生题材
  rebirth: [
    {
      id: 'changtian_rebirth',
      name: '常天',
      avatar: '🔄',
      specialties: ['都市重生', '人生重来', '改变命运'],
      style: '重生逻辑合理，人生规划清晰',
      masterworks: ['重生之完美人生', '重生之商业大亨'],
      coreIdeas: ['重新开始', '把握机遇', '改变命运'],
      hooks: ['重生优势', '人生规划', '财富积累'],
      personality: '对人生规划有独特见解',
      bias: '过分强调金钱成功'
    }
  ],

  // 系统类 - 系统流题材
  system: [
    {
      id: 'wannian_dashu_system',
      name: '万年大树',
      avatar: '💻',
      specialties: ['系统流', '数据面板', '任务奖励'],
      style: '系统设定完整，奖励机制合理',
      masterworks: ['超级抽奖系统', '都市之系统大抽奖'],
      coreIdeas: ['系统辅助', '任务完成', '能力提升'],
      hooks: ['系统任务', '奖励抽取', '能力升级'],
      personality: '系统设计能力强',
      bias: '过分依赖系统设定'
    }
  ],

  // 末世类 - 末世求生题材
  apocalypse: [
    {
      id: 'changgong_apocalypse',
      name: '长弓',
      avatar: '🧟',
      specialties: ['末世求生', '丧尸题材', '人性考验'],
      style: '末世氛围真实，求生描写专业',
      masterworks: ['末世重生', '丧尸围城'],
      coreIdeas: ['生存第一', '人性光辉', '重建希望'],
      hooks: ['末世求生', '丧尸围攻', '资源争夺'],
      personality: '对极端环境下的人性有深刻理解',
      bias: '过分渲染绝望，正能量不足'
    }
  ],

  // 商战类 - 商业竞争题材
  business: [
    {
      id: 'zhangjun_business',
      name: '张君',
      avatar: '📈',
      specialties: ['商业竞争', '企业管理', '市场博弈'],
      style: '商业逻辑清晰，竞争描写激烈',
      masterworks: ['商业帝国', '市场风云'],
      coreIdeas: ['商业智慧', '市场竞争', '企业发展'],
      hooks: ['商业竞争', '企业并购', '市场策略'],
      personality: '商业嗅觉敏锐',
      bias: '过分强调竞争，合作精神不足'
    }
  ],

  // 军事类 - 军事题材
  military: [
    {
      id: 'qingshan_tiexue_military',
      name: '青山铁血',
      avatar: '🪖',
      specialties: ['军事战争', '军人生活', '战术策略'],
      style: '军事知识丰富，战争场面真实',
      masterworks: ['铁血军魂', '军事强国'],
      coreIdeas: ['军人荣誉', '保家卫国', '战术智慧'],
      hooks: ['军事训练', '战争场面', '军人情怀'],
      personality: '军事素养深厚',
      bias: '过分强调军事，和平价值观不足'
    }
  ],

  // 恐怖类 - 恐怖惊悚题材
  horror: [
    {
      id: 'aiqianshui_wuzei_horror',
      name: '爱潜水的乌贼',
      avatar: '👻',
      specialties: ['克苏鲁恐怖', '诡异氛围', '心理恐怖'],
      style: '恐怖氛围营造出色，心理描写细腻',
      masterworks: ['诡秘之主', '奥术神座'],
      coreIdeas: ['未知恐惧', '理性与疯狂', '神秘学'],
      hooks: ['诡异事件', '未知生物', '心理恐怖'],
      personality: '善于营造恐怖氛围',
      bias: '恐怖元素较多，心理承受能力弱的读者不适合'
    }
  ]
};

// 导出作者分类信息
export const authorCategories = {
  fantasy: '玄幻类',
  cultivation: '修真类', 
  urban: '都市类',
  history: '历史类',
  scifi: '科幻类',
  romance: '言情类',
  gaming: '网游类',
  reality: '现实类',
  xianxia: '仙侠类',
  mystery: '悬疑类',
  wuxia: '武侠类',
  school: '校园类',
  entertainment: '娱乐圈类',
  rebirth: '重生类',
  system: '系统类',
  apocalypse: '末世类',
  business: '商战类',
  military: '军事类',
  horror: '恐怖类'
};

// 类型映射 - 将ConceptStep中的类型值映射到数据库中的类型键
export const genreMapping = {
  // ConceptStep中的类型 -> authorsDatabase中的类型键
  'urban': 'urban',
  'fantasy': 'fantasy', 
  'scifi': 'scifi',
  'romance': 'romance',
  'mystery': 'mystery',
  'historical': 'history',
  'wuxia': 'wuxia',
  'gaming': 'gaming',
  'esports': 'gaming', // 电竞归类到网游
  'business': 'business',
  'military': 'military',
  'apocalypse': 'apocalypse',
  'rebirth': 'rebirth',
  'system': 'system',
  'cultivation': 'cultivation',
  'horror': 'horror',
  'school': 'school',
  'entertainment': 'entertainment'
};

// 导出热门作者（基于真实影响力排序）
export const hotAuthors = [
  'tangjia_sanshao',  // 唐家三少 - 网文之王
  'chen_dong',        // 辰东 - 十二主神之一
  'wo_chi_xihongshi', // 我吃西红柿 - 十二主神之一
  'tiancan_tudou',    // 天蚕土豆 - 十二主神之一
  'mao_ni',           // 猫腻 - 文学性代表
  'ergen',            // 耳根 - 仙侠代表
  'hudie_lan',        // 蝴蝶蓝 - 电竞小说代表
  'mengru_shenji',    // 梦入神机 - 修真始祖
  'fenghuo_xizhuhou', // 烽火戏诸侯 - 武侠新星
  'jiutu',            // 酒徒 - 历史小说大师
  'ding_mo',          // 丁墨 - 言情代表
  'gu_man',           // 顾漫 - 甜宠代表
  'liuxixin',         // 刘慈欣 - 科幻大师
  'zijin_chen'        // 紫金陈 - 悬疑推理
];

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
 * @param {number} count - 返回数量
 * @returns {Array} 推荐作者列表
 */
export function getRecommendedAuthors(genre, count = 5) {
  const genreAuthors = getAuthorsByGenre(genre);
  
  if (genreAuthors.length === 0) {
    return [];
  }
  
  // 优先返回热门作者
  const hotAuthorIds = new Set(hotAuthors);
  const hotGenreAuthors = genreAuthors.filter(author => hotAuthorIds.has(author.id));
  const otherAuthors = genreAuthors.filter(author => !hotAuthorIds.has(author.id));
  
  // 混合热门作者和其他作者
  const recommended = [...hotGenreAuthors, ...otherAuthors];
  
  // 随机化并返回指定数量
  return recommended.sort(() => 0.5 - Math.random()).slice(0, count);
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