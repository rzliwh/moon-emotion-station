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
  },
  {
    id: 'wave_08',
    stage: '学习阶段',
    time: '22:40',
    delayMs: 8 * 60 * 60 * 1000,
    delayLabel: '次日早晨',
    text: '图书馆十点闭馆，我等到管理员催才走。第三遍做同一套真题，还是错在同一道题。走出大门，外面风很凉，月亮挂在教学楼顶上。不知道这条路还要走多久。',
    actions: [
      {
        label: '走过去',
        desc: '从月球上走过去，坐在ta旁边',
        traceType: 'footprint',
        traceColor: 0xf4a261,
        reply: '第二天早上，我把那道题又做了一遍。错的那一步突然想通了。不知道是不是昨晚有人在我旁边坐了一会儿，连风都小了一点。'
      },
      {
        label: '留一盏灯',
        desc: '在月球上为ta留一盏灯',
        traceType: 'light',
        traceColor: 0x4a90d9,
        reply: '回宿舍路上，路灯一路亮到楼下。我把错题拍下来，备注写了一句：今天先记着，明天再说。你留的那盏灯，我看见了。'
      },
      {
        label: '种点什么',
        desc: '在月球上种一颗种子',
        traceType: 'seedling',
        traceColor: 0x5cb85c,
        reply: '早上醒来，窗台那盆一直没动静的绿植冒了一个尖。不是名贵的那种，就是路边野草。你种的那颗，是不是也挑了个最难的时候发芽？'
      }
    ]
  },
  {
    id: 'wave_09',
    stage: '职场转折',
    time: '16:30',
    delayMs: 12 * 60 * 60 * 1000,
    delayLabel: '次日早晨',
    text: '下午方案被退回第六次。走出会议室的时候，打印机正好在吐纸，一张一张的，像在替我说刚才没说的话。电梯里遇到同事，问我今天顺利吗，我说还行。电梯门关上，玻璃上映出来的那张脸，快不认识自己了。',
    actions: [
      {
        label: '走过去',
        desc: '从月球上走过去，陪ta走一段',
        traceType: 'footprint',
        traceColor: 0xf4a261,
        reply: '晚上下班绕路走了很远。经过河边，风很凉，看到有个小孩在路灯下跳绳，数到一百又从头数。我想，我明天也会从头来一次。你陪我的那段路，好像没那么长了。'
      },
      {
        label: '留一盏灯',
        desc: '在月球上为ta留一盏灯',
        traceType: 'light',
        traceColor: 0x4a90d9,
        reply: '回到工位重新改第七版的时候，走廊的灯忽然全亮了。保洁阿姨说她只开了半排，不知道谁把另一半也打开了。那盏灯，是你留的吧？'
      },
      {
        label: '哼首歌',
        desc: '从月球上给ta哼一段旋律',
        traceType: 'melody',
        traceColor: 0xc77dff,
        reply: '晚上回家，脑子里还全是那个被退回的方案。打开歌单随便点了一首，前奏一响就愣住了。那首歌很久没听了，不知道是不是你哼的。'
      }
    ]
  },
  {
    id: 'wave_10',
    stage: '爱情',
    time: '01:30',
    delayMs: 20 * 60 * 60 * 1000,
    delayLabel: '次日晚上',
    text: '我们隔了三个时区，吵完架各自睡了。我睡到一半醒了，打开手机，看到你凌晨发来一句：晚安。没有解释，也没有和好。我盯着那条消息看了很久，不知道这句晚安是气话，还是你也醒着。',
    actions: [
      {
        label: '留一盏灯',
        desc: '在月球上为ta留一盏灯',
        traceType: 'light',
        traceColor: 0x4a90d9,
        reply: '第二天傍晚，你那边应该是白天。我拍了一张窗户边的光发过去，说今天这边夕阳很亮。你没回，但晚上你说：那盏灯，我看到了。我们好像也没说要和好，就是都不气了。'
      },
      {
        label: '种点什么',
        desc: '在月球上种一颗种子',
        traceType: 'seedling',
        traceColor: 0x5cb85c,
        reply: '第三天，你问我阳台那盆绿植是什么时候种的。其实我上个月就买了，一直没跟你说。可能有些话不是不说，是得等到发芽那天才敢说。你种的那颗，是不是也一样？'
      },
      {
        label: '哼首歌',
        desc: '从月球上给ta哼一段旋律',
        traceType: 'melody',
        traceColor: 0xc77dff,
        reply: '第二天我戴耳机时，播放列表里突然多了一首没听过的歌。我以为是你分享的，翻记录发现不是。可那首旋律我哼了一整天。是不是你从月球上哼过来的？'
      }
    ]
  },
  {
    id: 'wave_11',
    stage: '创业',
    time: '00:45',
    delayMs: 8 * 60 * 60 * 1000,
    delayLabel: '次日早晨',
    text: '办公室又只剩我一个人。第三个客户没有回消息，水电费单贴在门上，打印机还差两格墨。我坐在转椅上转了一圈，看到窗外的城市灯火通明，好像只有我这间屋子是暗的。不是怕失败，是怕没人知道我在坚持。',
    actions: [
      {
        label: '走过去',
        desc: '从月球上走过去，坐在ta对面',
        traceType: 'footprint',
        traceColor: 0xf4a261,
        reply: '第二天早上，第四个客户回了消息，说想约时间聊聊。我站在办公室窗前，把昨天贴在门上的水电费单撕下来。不知道是不是昨晚有人坐在对面，那间屋子看起来没那么暗了。'
      },
      {
        label: '留一盏灯',
        desc: '在月球上为ta留一盏灯',
        traceType: 'light',
        traceColor: 0x4a90d9,
        reply: '昨晚走的时候，我把楼下便利店留的灯当成了自己的灯，多看了两眼。今天开门，收银台后面的阿姨说：小伙子，你那盏灯昨天好像亮了一整晚。是你留的吗？'
      },
      {
        label: '种点什么',
        desc: '在月球上种一颗种子',
        traceType: 'seedling',
        traceColor: 0x5cb85c,
        reply: '我把电脑桌面壁纸换成了种子发芽的图。第五个客户还是没回，但前台多了一盆不知道谁送的小绿植。我想，今天先不死心，就算只是因为它发芽了。'
      }
    ]
  },
  {
    id: 'wave_12',
    stage: '至暗时刻',
    time: '23:10',
    delayMs: 8 * 60 * 60 * 1000,
    delayLabel: '次日早晨',
    text: '把车停进地下车库，熄了火，不想上楼。手机里有十几条未读消息，一条也不想回。我就这么坐了一会儿，车灯灭了，四周很黑。不是发生了什么大事，就是突然觉得，今天撑到这里已经用光了所有力气。',
    actions: [
      {
        label: '走过去',
        desc: '从月球上走过去，站在车窗外',
        traceType: 'footprint',
        traceColor: 0xf4a261,
        reply: '后来我还是上楼了。电梯门开的时候，走廊声控灯正好亮起来，像是在等谁。我把手机打开，回了家人一条：今天有点累，明天再说。你站在窗外的那段路，我好像收到了。'
      },
      {
        label: '留一盏灯',
        desc: '在月球上为ta留一盏灯',
        traceType: 'light',
        traceColor: 0x4a90d9,
        reply: '第二天早上，车位上方的灯比平时亮。我抬头看了一眼，觉得大概是物业换了灯泡，可还是有点想相信，是有人特意留的。'
      },
      {
        label: '哼首歌',
        desc: '从月球上给ta哼一段旋律',
        traceType: 'melody',
        traceColor: 0xc77dff,
        reply: '昨晚在车里坐的时候，广播里放了一首很老的歌。我记住了一句歌词，哼着进了门。今天白天，那句歌词还在脑子里，像条很细的线，把我从昨天拉到了今天。'
      }
    ]
  }
];
