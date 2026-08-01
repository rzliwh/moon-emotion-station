// 电波脚本数据：Lee 已确认内容，不要改文案。
export const SIGNALS_DATA = [
  {
    id: 'wave_01',
    time: '23:47',
    delayMs: 2 * 60 * 60 * 1000,
    delayLabel: '2小时后',
    text: '加班到现在，末班车走了，在等网约车。风吹得有点冷。',
    actions: [
      {
        label: '走过去',
        desc: '从月球上走过去，站在ta身边',
        traceType: 'footprint',
        traceColor: 0xf4a261,
        reply: '车来了。司机问要不要开暖风，我说不用。不知道是不是你从月球上抱了我一下，突然就暖和了。'
      },
      {
        label: '留一盏灯',
        desc: '在月球上为ta点一盏灯',
        traceType: 'light',
        traceColor: 0x4a90d9,
        reply: '上车了。路灯一盏一盏往后退，有一盏特别亮，不知道是不是你留的那盏。到家了，谢谢你。'
      },
      {
        label: '种点什么',
        desc: '在月球上种一颗种子',
        traceType: 'seedling',
        traceColor: 0x5cb85c,
        reply: '到家了。进门的时候踩到一颗不知道哪来的种子，弯腰捡起来，突然觉得没那么累了。你种的那颗，发芽了吗？'
      }
    ]
  },
  {
    id: 'wave_02',
    time: '14:22',
    delayMs: 30 * 60 * 1000,
    delayLabel: '30分钟后',
    text: '中午在食堂摔了餐盘，红烧肉糖醋汁溅了一身。下午还要开会，感觉今天没救了。',
    actions: [
      {
        label: '种点什么',
        desc: '在月球上种一颗种子',
        traceType: 'seedling',
        traceColor: 0x5cb85c,
        reply: '会开完了。衣服上还沾着糖醋汁，但没人注意到。你种的那颗种子开花了吗？我这边好像也有一点点甜味。'
      },
      {
        label: '哼首歌',
        desc: '从月球上给ta哼一段旋律',
        traceType: 'melody',
        traceColor: 0xc77dff,
        reply: '会开完了，比想象中顺利。耳机里不知道在放什么歌，旋律有点耳熟。是不是你哼的那首？'
      },
      {
        label: '留一盏灯',
        desc: '在月球上为ta点一盏灯',
        traceType: 'light',
        traceColor: 0x4a90d9,
        reply: '会开完了。走出会议室的时候走廊灯刚好亮了，像是有谁知道我今天需要一点光。是你留的吧？'
      }
    ]
  },
  {
    id: 'wave_03',
    time: '02:15',
    delayMs: 8 * 60 * 60 * 1000,
    delayLabel: '次日早晨',
    text: '搬进新房第一晚。什么都空空的，冰箱嗡嗡响，反而更睡不着了。',
    actions: [
      {
        label: '留一盏灯',
        desc: '在月球上为ta点一盏灯',
        traceType: 'light',
        traceColor: 0x4a90d9,
        reply: '天亮了。冰箱没那么响了，可能是习惯了吧。窗帘缝里漏进来一条光，像是谁给我留了盏灯。新生活，好像能过。'
      },
      {
        label: '走过去',
        desc: '从月球上走过去，站在窗外',
        traceType: 'footprint',
        traceColor: 0xf4a261,
        reply: '天亮了。窗外有脚印，不知道是不是你走过来留下的。新房子第一缕阳光照进来的时候，突然觉得没那么空了。'
      },
      {
        label: '种点什么',
        desc: '在月球上种一颗种子',
        traceType: 'seedling',
        traceColor: 0x5cb85c,
        reply: '天亮了。下楼买早餐的时候，门口花坛里不知道谁掉了一颗种子在那。是你让它来的吧？新生活，好像能过。'
      }
    ]
  },
  {
    id: 'wave_04',
    time: '16:40',
    delayMs: 8 * 60 * 60 * 1000,
    delayLabel: '次日早晨',
    text: '面试完出来，天还亮着。回程地铁上，自我介绍在脑子里过了一遍又一遍，越过越觉得有一句说砸了。手机握在手里，烫得难受。',
    actions: [
      {
        label: '走过去',
        desc: '从月球上走到ta身边',
        traceType: 'footprint',
        traceColor: 0xf4a261,
        reply: '早上被闹钟叫醒，顺手打开邮箱——通过了。原来那天那趟地铁，真的只是绕了个弯。不知道是不是你陪我走的那段，让路变短了。'
      },
      {
        label: '留一盏灯',
        desc: '在月球上为ta留一盏灯',
        traceType: 'light',
        traceColor: 0x4a90d9,
        reply: '早上被闹钟叫醒，手机屏幕亮着，邮箱里躺着入职通知。那盏灯好像真的照到了什么。'
      },
      {
        label: '哼首歌',
        desc: '从月球上给ta哼一段旋律',
        traceType: 'melody',
        traceColor: 0xc77dff,
        reply: '那首歌单曲循环了一晚上。今早到工位，邮箱里躺着入职通知。现在正戴着耳机，听那首。'
      }
    ]
  },
  {
    id: 'wave_05',
    time: '18:30',
    delayMs: 60 * 60 * 1000,
    delayLabel: '1小时后',
    text: '今天的晚霞特别好看，粉紫色的，铺了半边天。我在天台上看了十分钟，没人可以分享。就想发一条电波试试，看看月亮那边有没有人。',
    actions: [
      {
        label: '种点什么',
        desc: '在月球上种一颗种子',
        traceType: 'seedling',
        traceColor: 0x5cb85c,
        reply: '你说种就种了。刚刚去阳台浇花，发现养了三个月都没动静的那盆，冒了个尖。不知道是不是你的那颗。'
      },
      {
        label: '留一盏灯',
        desc: '在月球上为ta留一盏灯',
        traceType: 'light',
        traceColor: 0x4a90d9,
        reply: '我把晚霞拍下来了，设成了壁纸。晚上开会开得头大，抬头看了一眼，觉得还行，今天不算白过。好像有盏灯给今天收了个尾。'
      },
      {
        label: '哼首歌',
        desc: '从月球上给ta哼一段旋律',
        traceType: 'melody',
        traceColor: 0xc77dff,
        reply: '天台上那朵云散了，变成很淡很淡的粉色。像一首歌的尾音。不知道是不是你哼的。'
      }
    ]
  },
  {
    id: 'wave_06',
    time: '00:12',
    delayMs: 20 * 60 * 60 * 1000,
    delayLabel: '次日晚上',
    text: '路过我们以前常去的那家面馆，还在营业。走进去点了一碗一样的，吃了一半就吃不下去了。不是不好吃，是没人抢我碗里的香菜了。',
    actions: [
      {
        label: '留一盏灯',
        desc: '在月球上为ta留一盏灯',
        traceType: 'light',
        traceColor: 0x4a90d9,
        reply: '晚上回家，我把玄关的灯开着睡的。以前你最怕黑，现在好像也习惯了。灯亮着，心里就不空。'
      },
      {
        label: '哼首歌',
        desc: '从月球上给ta哼一段旋律',
        traceType: 'melody',
        traceColor: 0xc77dff,
        reply: '睡不着的时候听了一会儿潮汐。闭上眼，好像又回到那个夏天，我们在海边，你说月亮今晚特别圆。今天，也特别圆。'
      },
      {
        label: '走过去',
        desc: '从月球上走过去，坐在ta对面',
        traceType: 'footprint',
        traceColor: 0xf4a261,
        reply: '面馆老板今天问我，以前跟你一起来的那个人呢。我说她去月亮上了。老板笑，说那就常来坐坐，座位给你留着。'
      }
    ]
  },
  {
    id: 'wave_07',
    time: '08:05',
    delayMs: 10 * 60 * 60 * 1000,
    delayLabel: '傍晚6点',
    text: '周一的闹钟响到第三遍，我把它按掉了。躺了五分钟，想今天请假，又想不到请假干什么。起床的时候，感觉不是睡醒了，是机器充上电了。',
    actions: [
      {
        label: '种点什么',
        desc: '在月球上种一颗种子',
        traceType: 'seedling',
        traceColor: 0x5cb85c,
        reply: '上午忙到没空喝水，下午三点才想起那杯茶。接热水的时候，觉得今天好像也没那么难熬。你种的那颗，是不是也在发芽？'
      },
      {
        label: '哼首歌',
        desc: '从月球上给ta哼一段旋律',
        traceType: 'melody',
        traceColor: 0xc77dff,
        reply: '傍晚下班戴上耳机，点开那首歌。地铁刚好到站，门开的一瞬间，晚风吹进来。好像一周也不是很长。'
      },
      {
        label: '留一盏灯',
        desc: '在月球上为ta留一盏灯',
        traceType: 'light',
        traceColor: 0x4a90d9,
        reply: '晚上回家路上，真的看见一颗流星。很亮，很快就没了。我许了个愿：希望下周，能快点来。不知道是不是你点的那盏灯，让我看见了。'
      }
    ]
  }
];
