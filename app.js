const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const petInput = $('#petInput');
const petPreview = $('#petPreview');
const resultPetPhoto = $('#resultPetPhoto');
let petImage = '';
let petValidated = false;
let visionModel = null;
let detectedPetLabel = '';
const petWords = /cat|dog|terrier|retriever|shepherd|hound|spaniel|poodle|pug|chihuahua|shih-tzu|samoyed|husky|malamute|corgi|collie|mastiff|boxer|beagle|basenji|keeshond|schipperke|pinscher|schnauzer|whippet|borzoi|greyhound|dalmatian|pomeranian|bulldog|chow|akita|shiba|newfoundland|great dane|saint bernard|briard|kelpie|komondor|kuvasz|affenpinscher|papillon|pekinese|malinois|groenendael|rabbit|hare|hamster|guinea pig|parrot|macaw|cockatoo|lorikeet|bird/i;

const breedOptions={
  '狗狗':{
    '常见犬种':['柴犬','中华田园犬','柯基犬','金毛寻回犬','拉布拉多','哈士奇','萨摩耶','贵宾犬/泰迪','博美犬','比熊犬','法国斗牛犬','英国斗牛犬','边境牧羊犬','德国牧羊犬','澳大利亚牧羊犬','喜乐蒂牧羊犬','腊肠犬','吉娃娃','巴哥犬','雪纳瑞','约克夏梗','西高地白梗','杰克罗素梗','比格犬','秋田犬','松狮犬','沙皮犬','杜宾犬','罗威纳犬','拳师犬','大丹犬','圣伯纳犬','阿拉斯加雪橇犬','马尔济斯犬','西施犬','北京犬','蝴蝶犬','巴吉度猎犬','灵缇犬','阿富汗猎犬','斑点犬'],
    '中国与亚洲犬种':['重庆犬','昆明犬','下司犬','川东猎犬','细犬','藏獒','西藏梗','西藏猎犬','拉萨犬','冠毛犬','日本狆','日本尖嘴犬','甲斐犬','纪州犬','四国犬','珍岛犬','泰国脊背犬'],
    '稀有犬种':['墨西哥无毛犬','秘鲁无毛犬','挪威伦德猎犬','阿沙瓦犬','法老王猎犬','伊比赞猎犬','葡萄牙水犬','匈牙利牧羊犬/可蒙犬','波利犬','伯恩山犬','纽芬兰犬','大白熊犬','莱昂贝格犬','贝灵顿梗','捷克梗','丹迪丁蒙梗','猎水獭犬','卡塔胡拉豹犬','奇努克犬','布鲁塞尔格里芬犬','比利牛斯牧羊犬','西班牙水犬','意大利灵缇','罗秦犬','荷兰毛狮犬','巴仙吉犬','爱尔兰猎狼犬','苏俄猎狼犬'],
    '其他':['混种犬','品种不确定']
  },
  '猫猫':{
    '常见猫种':['德文卷毛猫','英国短毛猫','美国短毛猫','中华田园猫','布偶猫','暹罗猫','缅因猫','加菲猫/异国短毛猫','斯芬克斯猫','阿比西尼亚猫','孟加拉猫','金吉拉','苏格兰折耳猫','柯尼斯卷毛猫','曼基康猫','俄罗斯蓝猫','挪威森林猫','西伯利亚猫','伯曼猫','波斯猫','东方短毛猫','美国卷耳猫'],
    '稀有猫种':['拉波猫','塞尔凯克卷毛猫','德国卷毛猫','乌拉尔卷毛猫','彼得秃猫','顿斯科伊猫','狼猫/莱科伊猫','考曼尼猫','索科克猫','库里尔短尾猫','日本短尾猫','马恩岛猫','威尔士猫','土耳其梵猫','土耳其安哥拉猫','沙特尔猫','科拉特猫','埃及猫','新加坡猫','哈瓦那棕猫','孟买猫','缅甸猫','巴厘猫','奥西猫','玩具虎猫','萨凡纳猫','非洲狮子猫/乔西猫','内华达假面猫','尼伯龙猫','塞伦盖蒂猫','巴米拉猫','美国硬毛猫','澳大利亚雾猫'],
    '其他':['混种猫','短毛家猫','长毛家猫','品种不确定']
  },
  '其他萌宠':{
    '小型哺乳类':['兔子','仓鼠','豚鼠','雪貂','龙猫','蜜袋鼯','刺猬'],
    '鸟类':['虎皮鹦鹉','玄凤鹦鹉','牡丹鹦鹉','金刚鹦鹉','非洲灰鹦鹉','文鸟','金丝雀'],
    '其他':['爬宠','水族宠物','其他','品种不确定']
  }
};
function updateBreedOptions(){
  const type=$('#petType').value,select=$('#petBreed');
  const groups=Object.entries(breedOptions[type]).map(([group,items])=>`<optgroup label="${group}">${items.map(b=>`<option value="${b}">${b}</option>`).join('')}</optgroup>`).join('');
  select.innerHTML='<option value="auto">让 AI 帮我猜</option>'+groups;
}
$('#petType').addEventListener('change',updateBreedOptions); updateBreedOptions();
function inferredBreed(){
  const label=detectedPetLabel.toLowerCase(),type=$('#petType').value;
  const map=[['shiba','柴犬'],['corgi','柯基犬'],['golden retriever','金毛寻回犬'],['labrador','拉布拉多'],['siberian husky','哈士奇'],['samoyed','萨摩耶'],['pomeranian','博美犬'],['pug','巴哥犬'],['chihuahua','吉娃娃'],['dalmatian','斑点犬'],['siamese','暹罗猫'],['persian','波斯猫'],['egyptian cat','短毛家猫'],['tabby','短毛家猫'],['tiger cat','短毛家猫']];
  const found=map.find(([key])=>label.includes(key));
  return found?found[1]:(type==='猫猫'?'短毛家猫（品种不确定）':type==='狗狗'?'混种犬（品种不确定）':'品种暂不确定');
}

function setPhotoCheck(state,title,detail){
  const box=$('#photoCheck'); box.className=`photo-check ${state}`;
  box.querySelector('span').textContent=state==='valid'?'✓':state==='invalid'?'!':'◌';
  box.querySelector('strong').textContent=title; box.querySelector('small').textContent=detail;
}
function setAnalyzeReady(ready){
  petValidated=ready; const btn=$('#analyzeBtn'); btn.disabled=!ready;
  btn.innerHTML=ready?'<span>✦</span> 开始读取毛孩子人设':'<span>✦</span> 照片通过后才可分析';
}
async function loadVisionModel(){
  try{
    if(!window.mobilenet) throw new Error('library unavailable');
    visionModel=await window.mobilenet.load({version:2,alpha:1});
    setPhotoCheck('checking','识别模型已就绪','请上传一张清晰的宠物照片');
    if(petImage&&petPreview.complete) validatePetPhoto(petPreview);
  }catch(error){
    setPhotoCheck('invalid','识别模型加载失败','请检查网络并刷新页面，未验图不会生成报告');
  }
}
loadVisionModel();

function checkImageQuality(img){
  if(img.naturalWidth<220||img.naturalHeight<220) return '照片尺寸太小，请换一张更清晰的照片';
  const canvas=document.createElement('canvas'),size=64;canvas.width=size;canvas.height=size;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,size,size);
  const data=ctx.getImageData(0,0,size,size).data;let total=0,totalSq=0;
  for(let i=0;i<data.length;i+=4){const y=.299*data[i]+.587*data[i+1]+.114*data[i+2];total+=y;totalSq+=y*y}
  const n=data.length/4,mean=total/n,variance=totalSq/n-mean*mean;
  if(mean<35) return '照片太暗，看不清宠物特征';
  if(variance<180) return '照片细节太少或过于模糊，请重新拍摄';
  return '';
}
async function validatePetPhoto(img){
  setAnalyzeReady(false); setPhotoCheck('checking','正在检查照片…','确认画面中是否有清晰可见的宠物');
  const qualityIssue=checkImageQuality(img);
  if(qualityIssue){setPhotoCheck('invalid','这张照片暂时不能分析',qualityIssue);return}
  if(!visionModel){setPhotoCheck('invalid','识别模型尚未就绪','请稍等片刻或刷新页面，未验图不会生成报告');return}
  try{
    const predictions=await visionModel.classify(img,5);
    const petHit=predictions.find(item=>petWords.test(item.className)&&item.probability>.08);
    if(!petHit){
      const guess=predictions[0]?.className?.split(',')[0]||'其他物体';
      setPhotoCheck('invalid','没有检测到明确的宠物',`画面更像“${guess}”，请上传猫、狗或其他宠物的清晰照片`);return;
    }
    detectedPetLabel=petHit.className; setPhotoCheck('valid','照片检查通过',`检测到宠物特征 · ${Math.round(petHit.probability*100)}% 视觉置信度`); setAnalyzeReady(true);
  }catch(error){setPhotoCheck('invalid','照片检查没有完成','请换一张照片重试，未通过检查不会生成报告')}
}

const personas = [
  { title:'社牛运动健将', breed:'疑似 · 威尔士柯基犬', quote:'“路过的每个人，都可能是还没认识的新朋友。”', traits:['社交力 MAX','干饭积极','偶尔戏精'], scores:[78,96,82,38,91], os:'我不是精力旺盛，我只是在认真拓展自己的朋友圈。', owner:['活力陪玩型','愿意出门、情绪稳定，还能准点开饭的人类。'], love:['一起疯玩','陪它跑一圈，比隔空说十遍爱你更有用。'], tips:['每天安排一段专注互动时间','用小游戏消耗旺盛精力','表现兴奋时先让它冷静下来'], warning:'零食袋请放高一点，它已经研究过柜门结构了。' },
  { title:'高冷家庭董事长', breed:'疑似 · 英国短毛猫', quote:'“我不是不理你，我只是在等一个更正式的邀请。”', traits:['情绪稳定','巡视全屋','选择性黏人'], scores:[55,22,72,18,28], os:'可以摸，但请提前预约。突然抱我属于越级汇报。', owner:['安静读空气型','尊重边界、不强抱，也懂得适时递上罐头的人类。'], love:['安静陪伴','和你待在同一间房，就是它含蓄的告白。'], tips:['让它主动决定互动的开始','准备高处与隐蔽的安全角落','固定作息比突然的热情更重要'], warning:'尾巴快速甩动时先停手，董事长正在发出散会通知。' },
  { title:'小区情报局局长', breed:'疑似 · 中华田园犬', quote:'“三楼新来了谁？楼下袋子里装什么？我都要知道。”', traits:['好奇心 MAX','耳听八方','热心群众'], scores:[70,88,74,45,80], os:'不是我爱管闲事，是这个家不能没有一手情报。', owner:['耐心探索型','愿意带它闻世界，也能温和建立规则的人类。'], love:['共享情报','把今天见到的新鲜事都闻一遍，就是最好的约会。'], tips:['散步时留出充分嗅闻时间','用寻宝游戏满足探索欲','对门外动静建立安静口令'], warning:'门外一有响动就上线值班，记得给局长安排下班时间。' },
  { title:'干饭纪律委员', breed:'疑似 · 混种萌宠', quote:'“世界可以晚点拯救，但饭点绝对不能迟到。”', traits:['准时报饭','餐桌雷达','知足常乐'], scores:[66,58,99,62,44], os:'你说那是塑料袋的声音，我听见的明明是爱的召唤。', owner:['原则坚定型','宠它但不被眼神绑架，善于科学控制零食的人类。'], love:['投喂仪式','它记得每一口好吃的，也记得是谁递来的。'], tips:['把每日食量提前分装','用漏食玩具延长进食时间','不要用人类食物回应卖萌'], warning:'体重管理也是爱，楚楚可怜不代表真的没吃饱。' },
  { title:'人类睡眠监督员', breed:'疑似 · 橘色家猫', quote:'“你负责工作养家，我负责在键盘上提醒你休息。”', traits:['躺平专家','贴贴充电','夜间巡逻'], scores:[92,35,78,20,31], os:'电脑合上吧，我已经给你的腿安排了新的用途。', owner:['居家抱枕型','生活规律、怀里有空位，接受被安静跟随的人类。'], love:['贴贴充电','靠着你睡得四脚朝天，是它最高级别的信任。'], tips:['每天保留固定的陪伴时段','允许它在附近拥有专属位置','睡前短暂互动减少夜间跑酷'], warning:'长时间改变作息可能让它不安，忙完记得补上贴贴额度。' }
];

const radarAxes = [[125,25],[220,94],[184,205],[66,205],[30,94]];
const radarCenter = [125,115];
function updateDeepReport(p){
  const points=p.scores.map((score,i)=>{const t=score/100;return `${radarCenter[0]+(radarAxes[i][0]-radarCenter[0])*t},${radarCenter[1]+(radarAxes[i][1]-radarCenter[1])*t}`});
  $('#radarShape').setAttribute('points',points.join(' '));
  $('#radarDots').innerHTML=points.map(point=>{const [cx,cy]=point.split(',');return `<circle cx="${cx}" cy="${cy}" r="3.5"/>`}).join('');
  const labels=['黏人度','社牛值','干饭热情','拆家欲','运动量'];
  $('#scoreList').innerHTML=labels.map((label,i)=>`<div class="score-item"><span>${label}</span><b>${p.scores[i]}</b></div>`).join('');
  $('#innerOs').textContent=p.os; $('#ownerFit').textContent=p.owner[0]; $('#ownerDesc').textContent=p.owner[1];
  $('#loveLanguage').textContent=p.love[0]; $('#loveDesc').textContent=p.love[1];
  $('#careTips').innerHTML=p.tips.map(t=>`<li>${t}</li>`).join(''); $('#warningText').textContent=p.warning;
  updateDestinyReport(p.scores);
}

const destinyByTrait=[
  {past:['御前贴身侍卫','前世最大的任务不是保卫皇城，而是寸步不离地跟着最喜欢的人。'],career:['首席陪伴官','擅长察觉情绪、提供贴贴，并确保人类独处时间不超过五分钟。']},
  {past:['丝路驿站外交官','凭借超强社交力，在往来商队之间混得风生水起，主要工作是迎宾和蹭饭。'],career:['宠物公关总监','擅长主动破冰、调动气氛，以及让会议在零食出现时迅速达成共识。']},
  {past:['御膳房首席试吃官','每道菜出锅都要亲自把关，凭一张真诚的脸避免了无数食物浪费。'],career:['零食质量检测师','对包装袋声音高度敏感，能在三秒内完成气味、口感与分量审核。']},
  {past:['江湖机关破阵师','面对门栓、木箱与庭院围栏从不退缩，留下了许多待维修的传奇。'],career:['居家压力测试工程师','负责测试沙发、纸箱和充电线的耐用程度，工作态度极其主动。']},
  {past:['边关巡逻小将军','每日绕城巡查，风吹草动都逃不过它的眼睛，唯一弱点是饭点。'],career:['户外体验官','热衷探索新路线，擅长把普通散步升级成两小时深度考察。']}
];
function updateDestinyReport(scores){
  const top=Math.max(...scores),index=scores.indexOf(top),item=destinyByTrait[index];
  $('#pastLifeTitle').textContent=item.past[0]; $('#pastLifeDesc').textContent=item.past[1];
  $('#careerTitle').textContent=item.career[0]; $('#careerDesc').textContent=item.career[1]; $('#careerFit').textContent=`${Math.min(99,top+2)}%`;
}

const zodiacSigns=[['摩羯座',1,19,'土'],['水瓶座',2,18,'风'],['双鱼座',3,20,'水'],['白羊座',4,19,'火'],['金牛座',5,20,'土'],['双子座',6,21,'风'],['巨蟹座',7,22,'水'],['狮子座',8,22,'火'],['处女座',9,22,'土'],['天秤座',10,23,'风'],['天蝎座',11,22,'水'],['射手座',12,21,'火'],['摩羯座',12,31,'土']];
const elementMap={甲:'木',乙:'木',寅:'木',卯:'木',丙:'火',丁:'火',巳:'火',午:'火',戊:'土',己:'土',辰:'土',戌:'土',丑:'土',未:'土',庚:'金',辛:'金',申:'金',酉:'金',壬:'水',癸:'水',亥:'水',子:'水'};
function getZodiac(month,day){return zodiacSigns.find(([,m,d])=>month<m||(month===m&&day<=d))||zodiacSigns[0]}
function makeBirthProfile(dateValue,timeValue){
  const [year,month,day]=dateValue.split('-').map(Number),hasTime=Boolean(timeValue),[hour,minute]=(timeValue||'12:00').split(':').map(Number);
  if(!window.Solar) throw new Error('历法库未加载');
  const eight=Solar.fromYmdHms(year,month,day,hour,minute,0).getLunar().getEightChar();
  const pillars=[eight.getYear(),eight.getMonth(),eight.getDay(),eight.getTime()],used=hasTime?pillars:pillars.slice(0,3),counts={木:0,火:0,土:0,金:0,水:0};
  used.join('').split('').forEach(char=>{if(elementMap[char])counts[elementMap[char]]++});
  const zodiac=getZodiac(month,day);return {pillars:used.join(' '),counts,zodiac:zodiac[0],zodiacElement:zodiac[3],hasTime};
}
function birthCompatibility(owner,pet){
  const friendly={火:['火','风'],风:['风','火'],水:['水','土'],土:['土','水']};
  const zodiacScore=friendly[owner.zodiacElement].includes(pet.zodiacElement)?92:72;
  const keys=['木','火','土','金','水'];let complement=0,similarity=0;
  keys.forEach(key=>{const a=owner.counts[key],b=pet.counts[key];complement+=Math.min(2,Math.abs(a-b));similarity+=Math.min(a,b)});
  const baziScore=Math.min(98,62+complement*4+similarity*2),score=Math.round(zodiacScore*.4+baziScore*.6);
  const title=score>=90?'天选同频搭档':score>=82?'灵感互补型搭档':score>=74?'越处越默契组合':'需要慢慢磨合的缘分';
  const copy=score>=90?'性格节奏相近，陪伴方式也容易对上频道，属于很快就能建立默契的组合。':score>=82?'一个提供对方缺少的能量，差异反而让日常更有趣。':score>=74?'开始可能各有习惯，但稳定相处后会逐渐摸清彼此的表达方式。':'你们的节奏不完全一样，清晰边界和固定陪伴会让关系越来越稳。';
  return {score,title,copy,keys};
}
const bondFunProfiles=[
  {tags:['同频搭子','情绪接收器','越养越像'],roles:['你负责把日子安排好 · 它负责把日子变好玩','你提供稳定的生活节奏，它承包家里那些毫无预告的可爱瞬间。'],os:['“放心吧，我每天都有偷偷更爱你一点。”','它不一定把热情挂在脸上，但早已把你写进自己的安全区。'],sweet:['自动靠近模式','你刚坐下，它就会若无其事地把附近最舒服的位置占好。'],friction:['关心方式打架','你越担心越想靠近，它偶尔越需要一点不被打扰的空间。'],mission:['让它当一次路线总监','留出 15 分钟，让它决定闻哪里、停多久；你只负责陪着。'],lucky:['鼠尾草绿','傍晚饭后','陪伴不用催']},
  {tags:['反差萌组合','行动派联盟','快乐放大器'],roles:['你负责踩刹车 · 它负责一脚油门','一个考虑后果，一个先创造故事，组合起来刚好不无聊。'],os:['“我不是捣乱，我是在给我们的回忆加一点剧情。”','它最喜欢的并不是某个玩具，而是你愿意参与它的小世界。'],sweet:['突然对视就笑','它一个小表情，你已经知道下一秒是贴贴还是开饭。'],friction:['兴奋值超载','它上头时容易听不见，你疲惫时也容易把热情误读成调皮。'],mission:['完成一次三分钟寻宝','把三颗零食藏在安全位置，让它动鼻子，你负责真诚鼓掌。'],lucky:['日落橙','上午阳光时','先玩再讲理']},
  {tags:['慢热知己','安静守护','细节满分'],roles:['你负责读懂沉默 · 它负责默默跟随','你们的感情不靠热闹证明，很多爱都藏在同一间房里。'],os:['“我没有一直看你，只是刚好每次你回头我都在。”','它把熟悉的气味、脚步和声音，都当作一天里最稳的背景。'],sweet:['同空间陪伴','不用一直互动，只要彼此看得见，安全感就已经充满。'],friction:['信号太含蓄','双方都等对方先靠近时，可能错过一次本来很甜的邀请。'],mission:['发起一场安静约会','关掉手机十分钟，坐在它附近，让它自由决定靠多近。'],lucky:['雾霾蓝','睡前半小时','我在这里呀']},
  {tags:['饭搭子联盟','生活合伙人','稳定幸福'],roles:['你负责准点开饭 · 它负责准点提醒','你们用日常仪式积累感情，饭点、散步和晚安都有专属默契。'],os:['“世界那么大，但我最熟悉的是你开零食袋的声音。”','它记得的不只是吃过什么，也记得每一份好东西是谁递来的。'],sweet:['固定仪式感','同一句开饭口令、同一条回家路线，都能让它开心很久。'],friction:['规则被卖萌击穿','一个眼神就临时加餐，久了它会把撒娇当成正式谈判。'],mission:['创造一个专属暗号','选一句固定口令配合摸头或小游戏，坚持使用一周。'],lucky:['蜂蜜黄','早晨第一面','爱要有规律']}
];
function updateBondFun(owner,pet,result,seedText){
  const seed=[...seedText].reduce((sum,char)=>sum+char.charCodeAt(0),0),profile=bondFunProfiles[seed%bondFunProfiles.length];
  const dimensionNames=['陪伴同频','玩耍默契','情绪感应','生活节奏','互补能量'];
  const dimensionIcons=['♡','✦','☁','◷','☯'];
  const scores=dimensionNames.map((_,index)=>Math.max(58,Math.min(99,result.score+((seed>>(index*2))%17)-8)));
  $('#bondTags').innerHTML=profile.tags.map(tag=>`<span>${tag}</span>`).join('');
  $('#bondMeters').innerHTML=dimensionNames.map((name,index)=>`<div class="bond-meter"><span>${dimensionIcons[index]}</span><b>${name}</b><i><em style="width:${scores[index]}%"></em></i><strong>${scores[index]}</strong></div>`).join('');
  const pairs=[['bondRoles','bondRoleCopy',profile.roles],['bondOs','bondOsCopy',profile.os],['bondSweet','bondSweetCopy',profile.sweet],['bondFriction','bondFrictionCopy',profile.friction],['bondMission','bondMissionCopy',profile.mission]];
  pairs.forEach(([titleId,copyId,value])=>{$(`#${titleId}`).textContent=value[0];$(`#${copyId}`).textContent=value[1]});
  $('#bondColor').textContent=profile.lucky[0];$('#bondTime').textContent=profile.lucky[1];$('#bondCode').textContent=profile.lucky[2];
}
function runBirthMatch(){
  const ownerDate=$('#ownerBirthDate').value,petDate=$('#petBirthDate').value;
  if(!ownerDate||!petDate){showToast('请先填写主人和宠物的出生日期');return}
  try{
    const owner=makeBirthProfile(ownerDate,$('#ownerBirthTime').value),pet=makeBirthProfile(petDate,$('#petBirthTime').value),result=birthCompatibility(owner,pet);
    $('#birthScore').textContent=result.score;$('#zodiacPair').textContent=`${owner.zodiac} × ${pet.zodiac}`;$('#matchTitle').textContent=result.title;$('#matchCopy').textContent=result.copy;
    $('#ownerBazi').textContent=owner.pillars;$('#petBazi').textContent=pet.pillars;
    $('#elementBars').innerHTML=result.keys.map(key=>`<div class="element-pill"><span>${key}</span><b>${owner.counts[key]} : ${pet.counts[key]}</b></div>`).join('');
    updateBondFun(owner,pet,result,ownerDate+petDate);
    $('#birthdayNote').textContent=(!owner.hasTime||!pet.hasTime?'有一方未填写出生时间，本次仅使用三柱参考。':'双方均填写出生时间，本次使用完整四柱。')+' 算法为星座元素 40%＋五行互补 60%，仅供娱乐。';
    $('#birthResult').classList.add('show');
  }catch(error){showToast('历法算法还没准备好，请联网刷新后重试')}
}

const tarotCards=[
  {name:'太阳 THE SUN',icon:'☀️',up:['活力回升','这几天它的状态更加明亮主动，愿意探索、玩耍，也更容易表达亲近。','发现新的玩耍方式，或突然对某个角落产生浓厚兴趣。','安排一次它喜欢的游戏，把这份好心情接住。','“本周的我，自带小太阳。”'],down:['充电时刻','它可能比平时更想休息，不是不开心，只是在悄悄恢复自己的电量。','主动减少、睡眠增多，偏爱熟悉安静的位置。','别强行营业，留意正常饮食并给它充分休息。','“今天不营业，但爱你照常。”']},
  {name:'星星 THE STAR',icon:'⭐',up:['愿望靠近','近期安全感上升，一件期待已久的小事可能出现温柔进展。','更愿意靠近你，或终于接受新的玩具与空间。','保持耐心，用稳定回应巩固它的信任。','“我开始相信，好事会从你的手心掉下来。”'],down:['期待落空','它可能对某个改变暂时提不起兴趣，需要重新找到熟悉感。','新玩具被冷落，或面对新环境先躲起来观察。','不要催促，用旧毯子和熟悉气味帮它过渡。','“让我再观察一下，马上就好。”']},
  {name:'月亮 THE MOON',icon:'🌙',up:['感官放大','它会对声音、气味和你的情绪格外敏锐，夜间的小戏也可能增加。','突然盯着门口、夜里巡逻，或黏人方式变得含蓄。','维持作息，减少突然的噪声与环境变化。','“你没说出口的，我好像闻到了。”'],down:['迷雾散去','之前让它警觉的小事正在失去影响，状态逐渐轻松。','慢慢走出躲藏处，对曾经担心的东西重新靠近。','继续给予选择权，不要因为好转就突然推进。','“原来那只是影子，不是怪兽。”']},
  {name:'力量 STRENGTH',icon:'🦁',up:['勇气上线','它会比平时更有胆量，也更愿意尝试一件有点挑战的新鲜事。','主动接近陌生人，或克服以前不敢走的路线。','用奖励强化勇敢，但别把一次成功变成强迫。','“小小身体，也藏着大大勇气。”'],down:['温柔示弱','它可能暂时需要依靠你，逞强背后其实是在寻找确定感。','更频繁跟随你，面对刺激时容易退缩。','降低难度，允许撤退，让安全感先回来。','“我不是胆小，只是想借你一点勇气。”']},
  {name:'战车 THE CHARIOT',icon:'🏇',up:['行动加速','精力与探索欲同步上升，是适合开启新路线和新游戏的一周。','突然跑酷、催促出门，或对训练反应积极。','增加安全的运动与嗅闻，别让兴奋变成失控。','“目的地不重要，先冲起来再说！”'],down:['方向跑偏','能量很多但注意力分散，容易忙半天却不知道自己在忙什么。','来回奔跑、口令听一半，或玩到忘记休息。','把活动拆短，完成一个小目标就暂停奖励。','“我有计划，只是计划跑得比我快。”']},
  {name:'隐士 THE HERMIT',icon:'🏮',up:['独处回血','近期它更需要自己的空间，安静观察也是重要的心理整理。','选择独自睡觉，减少无效社交，但基本状态稳定。','尊重不被打扰的时间，让它主动回来找你。','“安静不是疏远，是我在整理小脑袋。”'],down:['孤单信号','它可能想靠近又有些犹豫，需要你发出更清晰温和的邀请。','在附近徘徊，却不主动贴近或参与。','坐低、侧身、轻声邀请，不要追着抱。','“再问我一次吧，这次我可能会答应。”']},
  {name:'命运之轮 WHEEL',icon:'🎡',up:['惊喜转场','日常节奏可能迎来一个有趣变化，适应后会发现新乐趣。','认识新伙伴、换散步路线，或解锁新的睡觉地点。','保留熟悉物品，让变化里仍有稳定锚点。','“今天的地图，好像偷偷更新了。”'],down:['计划延迟','预期中的变化可能慢一点发生，保持原节奏反而更舒服。','对新安排不配合，或重复熟悉的小习惯。','先别硬推，隔几天再用更小步骤尝试。','“命运可以转，但饭点不能改。”']},
  {name:'女皇 THE EMPRESS',icon:'🌿',up:['被爱包围','舒适、满足与亲密感增强，适合享受陪伴和温柔照料。','更爱撒娇、晒太阳，或在你身边睡得特别安心。','用梳毛、轻抚和安静陪伴回应这份信任。','“我负责可爱，你负责把爱续上。”'],down:['宠爱过量','它可能学会用卖萌争取额外待遇，边界正在悄悄变松。','零食要求升级，或用叫声指挥全家。','爱可以很多，但规则要一致，尤其是食量。','“再来一口，我保证这是最后一百口。”']},
  {name:'魔术师 MAGICIAN',icon:'✨',up:['聪明开挂','学习力和互动欲增强，很适合训练新动作或玩益智游戏。','快速破解玩具、学会新口令，也可能学会开柜门。','把聪明用在正途，提供安全的解谜挑战。','“你以为是魔法，其实是我会动脑。”'],down:['小聪明上线','它可能用聪明才智钻规则空子，表面无辜，行动周密。','趁你不注意偷吃，或找到禁区的新入口。','减少诱因，统一家庭规则，不要奖励卖萌逃责。','“证据呢？没有证据就不算我干的。”']},
  {name:'愚人 THE FOOL',icon:'🎒',up:['快乐冒险','好奇心会带它发现新的快乐，偶尔莽撞但整体气氛轻盈。','尝试陌生玩具、突然交朋友，或走向没去过的方向。','陪它探索，同时把牵引与居家安全做好。','“不知道去哪，但一定很好玩。”'],down:['冒失预警','冲动可能跑在判断前面，需要多一点安全管理。','跳上不稳的地方、猛追移动物体，或玩得太忘我。','检查门窗和危险物，把冒险放进可控范围。','“我承认先跳了，但落地方案还在想。”']},
  {name:'正义 JUSTICE',icon:'⚖️',up:['规则顺畅','稳定规则会让它表现得格外靠谱，互动更容易达成默契。','作息准时、训练配合，对清晰指令回应良好。','保持口令和奖励一致，它会理解得更快。','“公平就是你说到做到，我也努力做到。”'],down:['规则混乱','它可能因为家里标准不一致而反复试探，并非故意叛逆。','对不同家人的指令反应不同，偶尔选择性听见。','全家统一口令、边界和奖励标准。','“你们先开会统一一下，我再决定听谁的。”']},
  {name:'世界 THE WORLD',icon:'🌍',up:['圆满小周期','一段适应或学习正在完成，它会显得更加从容自信。','熟练掌握新习惯，或在熟悉环境里彻底放松。','用一次特别陪伴庆祝这个小小里程碑。','“这一关通关啦，奖励在哪里？”'],down:['差一点完成','进展已经很多，只差最后一点重复和耐心，不必急着换目标。','偶尔退回旧习惯，但整体方向仍在向前。','继续稳定练习，不因一次反复否定之前的努力。','“我快学会了，再给我一次机会。”']}
];
let selectedTarotQuestion='fortune';
const tarotQuestionLabels={fortune:'近期运势',thought:'它最近在想什么',message:'它想对我说什么',need:'它最近需要什么',relationship:'我们的关系状态',attention:'近期要注意什么'};
function shapeTarotReading(question,reading,reversed){
  const modes={
    fortune:{meaning:reading[1],label1:'可能发生',detail1:reading[2],label2:'铲屎官行动签',detail2:reading[3],quote:reading[4]},
    thought:{meaning:`它最近反复想着“${reading[0]}”。${reading[1]}`,label1:'藏在心里的潜台词',detail1:reading[4],label2:'你可以怎么回应',detail2:reading[3],quote:'“你不用完全猜中，只要愿意认真看我就好。”'},
    message:{meaning:`如果它能说话，这张牌最想替它表达的是：${reading[4]}`,label1:'它想让你知道',detail1:reading[1],label2:'收到以后',detail2:reading[3],quote:reading[4]},
    need:{meaning:`它近期最需要的是“${reading[0]}”带来的支持。${reading[1]}`,label1:'需求信号',detail1:reading[2],label2:'满足方式',detail2:reading[3],quote:'“不用准备很多，合适的一点点就很好。”'},
    relationship:{meaning:reversed?'你们最近的频道偶尔错开，但这更像一次重新对焦。':'你们之间正在形成更稳定的默契，细小回应也会被彼此接住。',label1:'关系中的信号',detail1:reading[2],label2:'增进默契',detail2:reading[3],quote:reading[4]},
    attention:{meaning:`这张牌提醒你留意“${reading[0]}”。${reading[1]}`,label1:'近期观察点',detail1:reading[2],label2:'温和应对',detail2:reading[3],quote:'“注意我，但别把每个小动作都想得太严重。”'}
  };return modes[question];
}
function drawTarot(button){
  if(button.classList.contains('locked')||button.classList.contains('chosen'))return;
  const card=tarotCards[Math.floor(Math.random()*tarotCards.length)],reversed=Math.random()<.34,reading=reversed?card.down:card.up;
  const front=button.querySelector('.card-front');front.innerHTML=`<i>${card.icon}</i><b>${card.name.split(' THE')[0]}</b><small>${reversed?'逆位':'正位'}</small>`;
  button.classList.add('chosen');if(reversed)button.classList.add('reversed');$$('.tarot-card').filter(item=>item!==button).forEach(item=>item.classList.add('locked'));
  const shaped=shapeTarotReading(selectedTarotQuestion,reading,reversed);
  $('#tarotPosition').textContent=reversed?'逆位 · 能量提醒':'正位 · 顺流能量';$('#tarotName').textContent=card.name;$('#tarotLuck').textContent=`${selectedTarotQuestion==='fortune'?'近期运势':'共鸣指数'} ${reversed?68+Math.floor(Math.random()*12):84+Math.floor(Math.random()*13)}`;
  $('#tarotMeaning').textContent=shaped.meaning;$('#tarotDetailLabel1').textContent=shaped.label1;$('#tarotEvent').textContent=shaped.detail1;$('#tarotDetailLabel2').textContent=shaped.label2;$('#tarotAdvice').textContent=shaped.detail2;$('#tarotOs').textContent=shaped.quote;
  $('#tarotReading').classList.add('show');$('#tarotHint').textContent=`你抽到了：${card.name.split(' THE')[0]} · ${reading[0]}`;
}
function resetTarot(){
  $$('.tarot-card').forEach(card=>{card.classList.remove('chosen','locked','reversed');card.querySelector('.card-front').innerHTML=''});$('#tarotReading').classList.remove('show');$('#tarotHint').textContent='凭第一感觉选一张 · 每次只解一张牌';
}

function handleFile(file){
  if(!file) return;
  if(file.size > 10 * 1024 * 1024){ showToast('照片有点大，请选择 10MB 以内的图片'); return; }
  const reader = new FileReader();
  setAnalyzeReady(false);
  reader.onload = e => {
    petImage = e.target.result;
    petPreview.onload=()=>validatePetPhoto(petPreview);
    petPreview.src = petImage;
    resultPetPhoto.src = petImage;
    $('#petDropzone').classList.add('has-image');
    $('.result-photo').classList.add('has-image');
  };
  reader.readAsDataURL(file);
}
petInput.addEventListener('change', e => handleFile(e.target.files[0]));
const dz = $('#petDropzone');
['dragenter','dragover'].forEach(name=>dz.addEventListener(name,e=>{e.preventDefault();dz.classList.add('drag')}));
['dragleave','drop'].forEach(name=>dz.addEventListener(name,e=>{e.preventDefault();dz.classList.remove('drag')}));
dz.addEventListener('drop',e=>handleFile(e.dataTransfer.files[0]));

$('#analyzeBtn').addEventListener('click', () => {
  if(!petImage||!petValidated){ showToast('照片需要先通过宠物识别检查 🐾'); dz.animate([{transform:'translateX(-7px)'},{transform:'translateX(7px)'},{transform:'none'}],{duration:260}); return; }
  const btn = $('#analyzeBtn'); btn.disabled = true; btn.innerHTML = '正在翻译毛孩子的小脑瓜…';
  setTimeout(()=>{
    const type=$('#petType').value,indices=type==='猫猫'?[1,4,3]:type==='狗狗'?[0,2,3]:[3];
    const base=personas[indices[Math.floor(Math.random()*indices.length)]];
    const chosen=$('#petBreed').value,breed=chosen==='auto'?inferredBreed():chosen;
    const p={...base,breed:`${chosen==='auto'?'AI 推测':'主人填写'} · ${breed}`};
    $('#resultPersona').textContent=p.title; $('#resultBreed').textContent=p.breed;
    $('#resultQuote').textContent=p.quote; $('#resultTraits').innerHTML=p.traits.map(t=>`<span>${t}</span>`).join(''); updateDeepReport(p);
    $('#parentBtn').disabled=false; $('#parentBtn').textContent='去测试';
    btn.disabled=false; btn.innerHTML='<span>✦</span> 再测一次新的人设';
    saveHistory(p); showToast('报告已存入毛孩子档案馆 ✦');
    $('.preview-card').scrollIntoView({behavior:'smooth',block:'center'});
  },900);
});

function saveHistory(p){
  const records=JSON.parse(localStorage.getItem('paw-personality-history')||'[]');
  records.unshift({id:Date.now(),name:$('#petName').value.trim()||'神秘毛孩子',type:$('#petType').value,date:new Date().toLocaleDateString('zh-CN'),image:petImage,title:p.title,breed:p.breed});
  localStorage.setItem('paw-personality-history',JSON.stringify(records.slice(0,12))); renderHistory();
}
function renderHistory(){
  const records=JSON.parse(localStorage.getItem('paw-personality-history')||'[]');
  $('#historyCount').textContent=records.length; $('#historyEmpty').classList.toggle('show',!records.length);
  $('#historyList').innerHTML=records.map(r=>`<article class="history-card"><img src="${r.image}" alt="${r.name}的照片"><div><small>${r.date} · ${r.type}</small><h3>${r.name}｜${r.title}</h3><p>${r.breed}</p></div></article>`).join('');
}
function switchView(name){
  $$('.view').forEach(v=>v.classList.toggle('active',v.id===`${name}View`));
  $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===name)); window.scrollTo({top:0,behavior:'smooth'});
}
const birthdaySection=$('.birthday-section');
const tarotSection=$('.tarot-section');
if(birthdaySection){birthdaySection.classList.remove('module-hidden');$('#birthdayMount').appendChild(birthdaySection)}
if(tarotSection){tarotSection.classList.remove('module-hidden');$('#tarotMount').appendChild(tarotSection)}
$$('[data-view]').forEach(el=>el.addEventListener('click',()=>switchView(el.dataset.view)));
$$('[data-tool]').forEach(card=>card.addEventListener('click',()=>{
  const tool=card.dataset.tool;
  if(tool==='parent'){switchView('test');showToast('完成一次宠物性格分析后，即可解锁主宠亲子相');return}
  if(tool==='profile'){switchView('test');showToast('完成性格测试，就能同时揭晓前世身份与现代职业');return}
  switchView(tool);
}));
const dialog=$('#parentDialog'); $('#parentBtn').addEventListener('click',()=>dialog.showModal()); $('.dialog-close').addEventListener('click',()=>dialog.close());
$('#ownerInput').addEventListener('change',e=>{ if(e.target.files[0]){$('#ownerFileName').textContent=e.target.files[0].name;$('#matchBtn').disabled=false;} });
$('#matchBtn').addEventListener('click',()=>{const n=82+Math.floor(Math.random()*16);$('.match-result strong').textContent=`${n}%`;$('#matchResult').classList.add('show');$('#matchBtn').textContent='缘分鉴定完成';});
$('#birthMatchBtn').addEventListener('click',runBirthMatch);
$$('[data-report-tab]').forEach(button=>button.addEventListener('click',()=>{$$('[data-report-tab]').forEach(b=>b.classList.remove('active'));button.classList.add('active');$$('[data-report-module]').forEach(module=>module.classList.toggle('module-hidden',module.dataset.reportModule!==button.dataset.reportTab))}));
$$('[data-question]').forEach(button=>button.addEventListener('click',()=>{selectedTarotQuestion=button.dataset.question;$$('[data-question]').forEach(b=>b.classList.remove('active'));button.classList.add('active');resetTarot();$('#tarotHint').textContent=`已选择「${tarotQuestionLabels[selectedTarotQuestion]}」· 凭第一感觉选一张`}));
$$('.tarot-card').forEach(card=>card.addEventListener('click',()=>drawTarot(card)));
$('#tarotAgain').addEventListener('click',resetTarot);

const dogQuizQuestions=[
  {text:'遇到不熟悉但友善的人时，它通常会主动靠近观察或打招呼。',dim:'social'},
  {text:'在家里，它经常主动跟随主人从一个房间走到另一个房间。',dim:'attachment'},
  {text:'看到牵引绳、玩具等活动信号时，它会迅速兴奋起来。',dim:'activity'},
  {text:'面对食物或开门等期待事件时，它能在提示下短暂等待。',dim:'regulation'},
  {text:'周围有轻度干扰时，它仍能把注意力转回主人。',dim:'trainability'},
  {text:'突然的声音或动作容易让它受到惊吓。',dim:'sensitivity'},
  {text:'在安全距离遇到陌生狗时，它愿意平静观察或尝试接触。',dim:'social'},
  {text:'休息时，它倾向选择离熟悉的人较近的位置。',dim:'attachment'},
  {text:'即使有玩耍机会，它多数时间仍更愿意安静休息。',dim:'activity',reverse:true},
  {text:'主人发出停止信号时，它通常能中断正在做的事。',dim:'regulation'},
  {text:'同一个简单规则练习几次后，它通常能逐渐理解。',dim:'trainability'},
  {text:'害怕之后，它通常需要较长时间才能完全放松。',dim:'sensitivity'},
  {text:'到一个陌生但安全的地方后，它会主动探索环境。',dim:'social'},
  {text:'受到惊吓或不安时，它会主动寻找主人获得安全感。',dim:'attachment'},
  {text:'清醒时，它会主动邀请人或其他动物玩耍。',dim:'activity'},
  {text:'得不到想要的东西时，它会持续吠叫、扒拉或反复尝试。',dim:'regulation',reverse:true},
  {text:'在安全环境被呼唤时，它大多数时候会回头或靠近。',dim:'trainability'},
  {text:'主人的语气或情绪发生变化时，它会明显调整自己的行为。',dim:'sensitivity'},
  {text:'面对新的对象或环境，它常长时间躲避、不愿接近。',dim:'social',reverse:true},
  {text:'即使较长时间看不到主人，它通常也完全不在意对方的位置。',dim:'attachment',reverse:true},
  {text:'户外活动结束后，它仍常表现出继续探索或运动的意愿。',dim:'activity'},
  {text:'激动玩耍后，它能在合理时间内恢复平静。',dim:'regulation'},
  {text:'短时间训练中，它很快失去兴趣且难以重新投入。',dim:'trainability',reverse:true},
  {text:'面对多数陌生事件，它通常很放松，很少出现紧张反应。',dim:'sensitivity',reverse:true}
];
const dogQuizDims={
  social:{label:'社牛值',icon:'🤝',high:'新朋友雷达常开，陌生场合也敢先闻为敬。',mid:'会先观察气氛，确认安全后再决定要不要营业。',low:'慢热不是高冷，它更需要距离与熟悉感。'},
  attachment:{label:'黏人度',icon:'🧲',high:'很在意家人的位置，陪伴就是它的重要安全感。',mid:'贴贴和独处切换自如，是有边界感的家人。',low:'独立频道信号强，爱你但不必时时在线。'},
  activity:{label:'活跃度',icon:'⚡',high:'身体里像装了小马达，行动永远比犹豫更快。',mid:'玩时尽兴、歇时安稳，能量档位比较均衡。',low:'舒服躺平是正经事，更偏爱低强度探索。'},
  regulation:{label:'自控力',icon:'🧘',high:'兴奋之后收得回来，规则感与情绪刹车都不错。',mid:'平时能听劝，上头时还需要一点温柔提醒。',low:'冲动常跑在脑子前面，适合从简单等待练起。'},
  trainability:{label:'学习力',icon:'🎓',high:'很会捕捉提示和反馈，是愿意和人合作的小学霸。',mid:'有兴趣时学得快，奖励方式选对会更投入。',low:'可能更看重环境和动机，需要短时、多奖励的练习。'},
  sensitivity:{label:'敏感度',icon:'📡',high:'对声音、气氛和情绪变化很敏锐，小心心雷达在线。',mid:'能觉察变化，也通常有自己的恢复节奏。',low:'神经比较大条，面对多数小变化都能淡定经过。'}
};
const dogQuizOptions=[{value:1,label:'从不'},{value:2,label:'很少'},{value:3,label:'有时'},{value:4,label:'经常'},{value:5,label:'几乎总是'},{value:0,label:'未观察到 / 不适用'}];
const dogLifeQuestions=[
  {label:'玩具偏好',text:'平时面对玩具，它最常见的态度是？',options:['玩具一出现就来劲','有喜欢的特定玩具','偶尔陪玩一下','基本不感兴趣','没观察过']},
  {label:'出门态度',text:'发现要出门玩时，它通常会？',options:['立刻冲到门口','开心但能等一等','看地点和心情','明显不太想出门','没观察过']},
  {label:'门铃反应',text:'听见敲门声或门铃时，它通常会？',options:['完全淡定','看一眼或竖起耳朵','叫几声提醒','持续叫并守在门边','躲开或显得紧张','没遇到过']},
  {label:'害怕方式',text:'它感到害怕时，最常见的表现是？',options:['发抖或身体僵住','躲进角落或家具后','主动靠近求抱抱','来回走动或叫唤','很少感觉到它害怕','没观察清楚']},
  {label:'回家仪式',text:'主人回家时，它通常怎么迎接？',options:['超级开心地靠近','激动到蹦跳或转圈','平静地过来看看','远处观察，稍后再来','基本没什么反应','不确定']},
  {label:'居家状态',text:'在家放松时，它最像下面哪一种？',options:['哪里舒服就随地瘫着','喜欢跟着家人移动','独自巡视和探索','经常叼玩具找人互动','偏爱躲在安静角落','没有固定模式']}
];
const dogBonusQuestions=[
  {step:1,key:'dogSocial',label:'狗狗社交',text:'遇到其他友善狗狗时，它通常愿意怎样相处？',options:['主动靠近，想一起玩','礼貌闻闻，能和平相处','看对象，合眼缘才营业','更愿意保持距离','容易叫喊、扑冲或发生冲突','没观察过']},
  {step:4,key:'food',label:'干饭反应',text:'看到正餐或喜欢的零食时，它通常是什么反应？',options:['流口水、守着饭盆等不及','听见包装声就冲过来','开心但能等开饭','慢悠悠，不着急吃','对零食和食物比较冷漠','没观察过']}
];
let dogQuizStep=0;
let dogQuizAnswers=Array(24).fill(null);
let dogLifeAnswers=Array(6).fill(null);
let dogBonusAnswers={dogSocial:null,food:null};

function renderDogQuizStep(){
  const start=dogQuizStep*4;
  const items=dogQuizQuestions.slice(start,start+4);
  $('#quizStepLabel').textContent=`第 ${dogQuizStep+1} 组 / 共 6 组`;
  const answeredCount=dogQuizAnswers.filter(v=>v!==null).length+dogLifeAnswers.filter(v=>v!==null).length+Object.values(dogBonusAnswers).filter(v=>v!==null).length;
  $('#quizProgressText').textContent=`${answeredCount} / 32`;
  $('#quizProgressBar').style.width=`${(answeredCount/32)*100}%`;
  const coreMarkup=items.map((q,offset)=>{
    const index=start+offset;
    return `<article class="quiz-question"><h3><span>${String(index+1).padStart(2,'0')}</span>${q.text}</h3><div class="quiz-options">${dogQuizOptions.map(option=>`<label class="quiz-option"><input type="radio" name="quiz-${index}" value="${option.value}" ${dogQuizAnswers[index]===option.value?'checked':''}><span>${option.value?`${option.value} · `:''}${option.label}</span></label>`).join('')}</div></article>`;
  }).join('');
  const life=dogLifeQuestions[dogQuizStep];
  const lifeMarkup=`<article class="quiz-question"><h3>${life.text}</h3><div class="quiz-options">${life.options.map((label,i)=>`<label class="quiz-option"><input type="radio" name="life-${dogQuizStep}" value="${i}" ${dogLifeAnswers[dogQuizStep]===i?'checked':''}><span>${label}</span></label>`).join('')}</div></article>`;
  const bonus=dogBonusQuestions.find(question=>question.step===dogQuizStep);
  const bonusMarkup=bonus?`<article class="quiz-question"><h3>${bonus.text}</h3><div class="quiz-options">${bonus.options.map((label,i)=>`<label class="quiz-option"><input type="radio" name="bonus-${bonus.key}" value="${i}" ${dogBonusAnswers[bonus.key]===i?'checked':''}><span>${label}</span></label>`).join('')}</div></article>`:'';
  $('#quizQuestionList').innerHTML=coreMarkup+lifeMarkup+bonusMarkup;
  $$('#quizQuestionList input[name^="quiz-"]').forEach(input=>input.addEventListener('change',event=>{
    const index=Number(event.target.name.replace('quiz-',''));
    dogQuizAnswers[index]=Number(event.target.value);
    const total=dogQuizAnswers.filter(v=>v!==null).length+dogLifeAnswers.filter(v=>v!==null).length+Object.values(dogBonusAnswers).filter(v=>v!==null).length;
    $('#quizProgressText').textContent=`${total} / 32`;
    $('#quizProgressBar').style.width=`${(total/32)*100}%`;
    updateDogQuizNext();
  }));
  $$(`#quizQuestionList input[name="life-${dogQuizStep}"]`).forEach(input=>input.addEventListener('change',event=>{
    dogLifeAnswers[dogQuizStep]=Number(event.target.value);
    const total=dogQuizAnswers.filter(v=>v!==null).length+dogLifeAnswers.filter(v=>v!==null).length+Object.values(dogBonusAnswers).filter(v=>v!==null).length;
    $('#quizProgressText').textContent=`${total} / 32`;$('#quizProgressBar').style.width=`${(total/32)*100}%`;updateDogQuizNext();
  }));
  if(bonus){$$(`#quizQuestionList input[name="bonus-${bonus.key}"]`).forEach(input=>input.addEventListener('change',event=>{dogBonusAnswers[bonus.key]=Number(event.target.value);const total=dogQuizAnswers.filter(v=>v!==null).length+dogLifeAnswers.filter(v=>v!==null).length+Object.values(dogBonusAnswers).filter(v=>v!==null).length;$('#quizProgressText').textContent=`${total} / 32`;$('#quizProgressBar').style.width=`${(total/32)*100}%`;updateDogQuizNext()}))}
  $('#quizBackBtn').disabled=dogQuizStep===0;
  $('#quizNextBtn').innerHTML=dogQuizStep===5?'查看犬格报告 <span>✦</span>':'下一组 <span>→</span>';
  updateDogQuizNext();
}
function updateDogQuizNext(){
  const start=dogQuizStep*4;
  const bonus=dogBonusQuestions.find(question=>question.step===dogQuizStep);
  $('#quizNextBtn').disabled=!dogQuizAnswers.slice(start,start+4).every(v=>v!==null)||dogLifeAnswers[dogQuizStep]===null||(bonus&&dogBonusAnswers[bonus.key]===null);
}
function startDogQuiz(){
  dogQuizStep=0;dogQuizAnswers=Array(24).fill(null);dogLifeAnswers=Array(6).fill(null);dogBonusAnswers={dogSocial:null,food:null};
  $('#quizIntro').hidden=true;$('#quizResult').hidden=true;$('#quizFormPanel').hidden=false;
  renderDogQuizStep();
}
function dogQuizTitle(scores){
  const top=Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([key])=>key);
  const key=[...top].sort().join('+');
  const titles={'activity+social':'社牛运动健将','attachment+sensitivity':'高敏黏人小卫星','regulation+trainability':'冷静纪律委员','activity+trainability':'行动派小学霸','attachment+social':'全家外交官','regulation+sensitivity':'谨慎观察家','activity+regulation':'精力管理大师','attachment+trainability':'默契跟班队长'};
  return titles[key]||`${dogQuizDims[top[0]].label}领航员`;
}
function escapeQuizText(value){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function buildWrittenReport(petName,scores,top,second,low){
  const name=escapeQuizText(petName);
  const level=(score,high,mid,lowText)=>score>=70?high:score>=40?mid:lowText;
  const fear=['受到压力时，身体可能先变得僵硬或发抖，需要安静环境慢慢恢复。','害怕时更倾向躲开刺激，安全角对它来说非常重要。','不安时会主动寻找家人，把亲近的人当作安全基地。','紧张时可能来回走动或发出声音，需要主人帮助它降低环境压力。','日常很少显露害怕，但仍要留意细微的回避和身体信号。','目前还没有足够线索判断它害怕时的表达方式。'][dogLifeAnswers[3]];
  const greeting=['回家时会用热情靠近表达想念，重逢是它每天的重要仪式。','重逢的兴奋常直接写在动作里，蹦跳和转圈都是情绪满格的信号。','会平静地确认你回来了，感情稳定但表达并不夸张。','习惯先远远确认情况，等自己准备好后再来互动。','对回家动静反应较淡，不等于没有感情，可能只是表达方式更独立。','目前还不能确定它的迎接习惯。'][dogLifeAnswers[4]];
  const home=['在家很会寻找舒服位置，随地瘫着通常意味着它对环境足够放心。','在家喜欢跟随家人移动，参与感和陪伴感对它很重要。','在家也保持巡视与探索，空间变化很容易吸引它的注意。','居家状态依然充满互动欲，玩具是它邀请家人加入的社交工具。','更偏爱安静角落，给它保留不被打扰的区域会更舒服。','居家表现比较多变，很难被单一模式概括。'][dogLifeAnswers[5]];
  const food=['食物动机很强，零食会是有效奖励，但更要练习等待和控制摄入。','对包装声和食物线索十分敏锐，用小份奖励训练通常很有吸引力。','对吃饭有期待但还能保持节奏，食物奖励和其他奖励可以搭配使用。','吃饭比较从容，训练时可能需要更有吸引力的奖励。','对普通食物动力偏低，可以尝试玩具、称赞或环境探索作为奖励。','目前还没有足够信息判断它的食物动力。'][dogBonusAnswers.food];
  const sections=[
    ['🧭 核心性格',`${name}最鲜明的两个特征是${dogQuizDims[top].label}和${dogQuizDims[second].label}。${level(scores.regulation,'它通常有自己的判断，也能在规则中找到舒服的位置。','它有主意，也愿意在合适的时候听听人类的意见。','它的行动常常跑在思考前面，与其说“不听话”，不如说需要更清楚、更容易成功的规则。')}`],
    ['🤝 社交模式',level(scores.social,`${name}对外界抱有较强兴趣，遇到新对象更愿意主动收集信息。`,` ${name}属于先看气氛再决定是否营业的类型，熟悉之后往往更放松。`,`${name}比较慢热，保持距离是它管理安全感的方式，不应该被强迫打招呼。`)],
    ['🫶 和主人的关系',`${level(scores.attachment,`${name}很在意家人的位置，陪伴是它确认安全的重要方式。`,`${name}能在贴贴与独处之间切换，既需要连接也保留自己的空间。`,`${name}的感情表达相对独立，不总黏着并不代表不亲近。`)} ${greeting}`],
    ['📡 情绪与安全感',`${level(scores.sensitivity,`${name}对声音、语气和环境变化很敏锐，情绪恢复需要被尊重。`,`${name}能察觉变化，通常也有自己的调节节奏。`,`${name}面对多数变化比较淡定，但仍会用细小动作表达边界。`)} ${fear}`],
    ['🎓 学习与规则',level(scores.trainability,`${name}很会捕捉人的提示，短而清晰的练习能让它快速建立成就感。`,`${name}在有兴趣时学习效率不错，奖励选得合适比重复口令更重要。`,`${name}可能不是传统意义上的“服从型学生”，更适合短时练习、低干扰环境和即时奖励。`)],
    ['🏠 日常生活',`${home} ${food}`],
    ['⚠️ 容易踩到的雷',`${name}相对需要照顾的是${dogQuizDims[low].label}。不要用突然逼近、持续催促或反复惩罚来换取表面服从；先降低难度，让它知道下一步该做什么。`],
    ['🌱 最适合的相处方式',`把${name}当成一个有偏好、有节奏的家庭成员。规律作息、可预测的边界、短而愉快的训练，以及允许它主动选择是否互动，会比一味要求“乖”更能建立长期默契。`]
  ];
  $('#quizWrittenHeadline').textContent=`${petName}的完整性格说明`;
  $('#quizWrittenIntro').textContent=`${petName}是个很有自己想法的狗狗。它并不是一个固定标签，而是会随着环境、年龄和与家人的关系，展现出不同侧面。下面这份报告把本次回答拆成几个最值得留意的部分。`;
  $('#quizWrittenSections').innerHTML=sections.map(([title,copy])=>`<article><h3>${title}</h3><p>${copy}</p></article>`).join('');
}
function showDogQuizResult(){
  const totals={social:0,attachment:0,activity:0,regulation:0,trainability:0,sensitivity:0};
  const counts={social:0,attachment:0,activity:0,regulation:0,trainability:0,sensitivity:0};
  dogQuizQuestions.forEach((q,i)=>{const answer=dogQuizAnswers[i];if(answer>0){totals[q.dim]+=q.reverse?6-answer:answer;counts[q.dim]++}});
  const scores=Object.fromEntries(Object.entries(totals).map(([key,total])=>[key,counts[key]?Math.round(((total/counts[key])-1)/4*100):50]));
  const ranked=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const top=ranked[0][0],second=ranked[1][0],low=ranked[ranked.length-1][0];
  const petName=$('#quizPetName').value.trim()||'你家毛孩子';
  const title=dogQuizTitle(scores);
  $('#quizResultName').textContent=`${petName}的犬格报告`;
  $('#quizResultTitle').textContent=title;
  $('#quizResultSummary').textContent=`它最突出的频道是「${dogQuizDims[top].label}」，同时带着「${dogQuizDims[second].label}」的底色。不是固定标签，而是此刻生活状态的一张行为快照。`;
  buildWrittenReport(petName,scores,top,second,low);
  const center={x:170,y:165},radius=120;
  const points=Object.keys(dogQuizDims).map((key,i)=>{const angle=(-90+i*60)*Math.PI/180;const r=radius*scores[key]/100;return {x:center.x+Math.cos(angle)*r,y:center.y+Math.sin(angle)*r};});
  $('#quizRadarShape').setAttribute('points',points.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
  $('#quizRadarDots').innerHTML=points.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5"/>`).join('');
  $('#quizScores').innerHTML=Object.entries(dogQuizDims).map(([key,dim])=>`<div class="quiz-score-row"><header><span>${dim.icon} ${dim.label}</span><b>${scores[key]}</b></header><div class="quiz-score-track"><i style="width:${scores[key]}%"></i></div><p>${scores[key]>=70?dim.high:scores[key]>=40?dim.mid:dim.low}</p></div>`).join('');
  $('#quizInsightGrid').innerHTML=`<article class="quiz-insight"><small>🏆 天赋组合</small><strong>${dogQuizDims[top].label} × ${dogQuizDims[second].label}</strong><p>${dogQuizDims[top].high}</p></article><article class="quiz-insight"><small>💭 内心 OS</small><strong>“请按我的频道理解我”</strong><p>${scores.sensitivity>=65?'我不是想太多，只是世界的声音在我这里比较响。':scores.activity>=65?'我没有捣乱，我只是在给旺盛精力找一个出口。':'我有自己的节奏，熟悉以后会把真心慢慢交出来。'}</p></article>`;
  $('#quizBehaviorProfile').innerHTML=dogLifeQuestions.map((question,index)=>`<div class="quiz-behavior-item"><small>${question.label}</small><b>${question.options[dogLifeAnswers[index]]}</b></div>`).join('');
  const socialIndex=[96,82,62,38,14,50][dogBonusAnswers.dogSocial];
  const battleIndex=[18,26,48,32,92,50][dogBonusAnswers.dogSocial];
  const foodIndex=[100,92,72,48,16,50][dogBonusAnswers.food];
  const streetTitles=['小区和平大使','礼貌社交委员','选择性营业选手','高冷独行侠','打遍小区无敌手 · 自封狗王','江湖身份待解锁'];
  const foodTitles=['干饭永动机','零食雷达满格','准点食堂客','佛系吃播','食物冷淡家','干饭属性待观察'];
  $('#quizStreetTitle').textContent=`${streetTitles[dogBonusAnswers.dogSocial]}｜${foodTitles[dogBonusAnswers.food]}`;
  $('#quizStreetMeters').innerHTML=[['🤝 友好程度',socialIndex],['⚔️ 战斗气场',battleIndex],['🍗 干饭热情',foodIndex]].map(([label,value])=>`<div class="quiz-street-meter"><header><span>${label}</span><b>${value}</b></header><div><i style="width:${value}%"></i></div></div>`).join('');
  const advice={social:'不必强迫它社交；给它可退开的距离，让每次新接触短而愉快。',attachment:'练习短时间、可预测的独处，用嗅闻垫或耐咬玩具建立安全感。',activity:'把训练拆成短小的游戏，并安排嗅闻、寻宝等低冲击消耗。',regulation:'从等待1秒、停止玩耍等微小成功开始，及时奖励冷静下来的瞬间。',trainability:'缩短单次练习，换成更喜欢的奖励，并尽量在低干扰环境起步。',sensitivity:'减少突然刺激，提供固定安全角；恢复慢时不催促，也不要用惩罚压住害怕。'};
  $('#quizAdvice').textContent=`目前相对需要支持的是「${dogQuizDims[low].label}」：${advice[low]}`;
  const validCount=dogQuizAnswers.filter(answer=>answer>0).length;
  $('#quizCompleteness').textContent=`六维有效作答 ${validCount} / 24 · 生活画像 8 / 8`;
  $('#quizFormPanel').hidden=true;$('#quizResult').hidden=false;
  $('#quizResult').scrollIntoView({behavior:'smooth',block:'start'});
}
$('#quizStartBtn').addEventListener('click',startDogQuiz);
$('#quizBackBtn').addEventListener('click',()=>{if(dogQuizStep>0){dogQuizStep--;renderDogQuizStep();window.scrollTo({top:$('#dogquizView').offsetTop,behavior:'smooth'})}});
$('#quizNextBtn').addEventListener('click',()=>{
  if(dogQuizStep<5){dogQuizStep++;renderDogQuizStep();window.scrollTo({top:$('#dogquizView').offsetTop,behavior:'smooth'});return}
  const button=$('#quizNextBtn');button.disabled=true;button.textContent='正在生成报告…';$('#quizStatus').textContent='正在整理六维得分，请稍候。';
  try{showDogQuizResult();$('#quizStatus').textContent=''}catch(error){console.error('犬格报告生成失败',error);button.disabled=false;button.innerHTML='重新生成报告 <span>✦</span>';$('#quizStatus').textContent='报告生成遇到问题，请点击“重新生成报告”。'}
});
$('#quizRetakeBtn').addEventListener('click',()=>{$('#quizResult').hidden=true;$('#quizIntro').hidden=false;$('#quizIntro').scrollIntoView({behavior:'smooth',block:'start'})});
function showToast(text){const t=$('#toast');t.textContent=text;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),2400)}
renderHistory();
updateDeepReport(personas[0]);
