export interface SampleLesson {
  id: string;
  title: string;
  description: string;
  text: string;
}

export const SAMPLE_LESSONS: SampleLesson[] = [
  {
    id: 'long_immersive_course',
    title: 'Long Immersive Chinese Video (35 Sentences across Environments)',
    description: 'Long-form professional Chinese video script with Hanzi, Pinyin, English Meaning, and Dynamic Environments',
    text: `[Coffee Shop]
我每天早上六点起床，先喝一杯热咖啡。
Wǒ měitiān zǎoshang liù diǎn qǐchuáng, xiān hē yībēi rè kāfēi.
I wake up at six o'clock every morning and drink a cup of hot coffee first.

今天的天气非常好，阳光明媚。
Jīntiān de tiānqì fēicháng hǎo, yángguāng míngmèi.
Today's weather is exceptionally good with bright sunshine.

[Office]
请问，今天的会议几点开始？
Qǐngwèn, jīntiān de huìyì jǐ diǎn kāishǐ?
Excuse me, what time does today's meeting start?

会议将在上午十点在会议室举行。
Huìyì jiāng zài shàngwǔ shí diǎn zài huìyìshì jǔxíng.
The meeting will be held in the conference room at 10:00 AM.

请大家准备好项目的 PowerPoint 演示文稿。
Qǐng dàjiā zhǔnbèi hǎo xiàngmù de yǎntuí wéngǎo.
Please everyone prepare the project PowerPoint presentation.

[Restaurant]
服务员，请给我们看一下菜单。
Fúwùyuán, qǐng gěi wǒmen kàn yīxià càidān.
Waiter, please show us the menu.

我想点一盘宫保鸡丁和两碗米饭。
Wǒ xiǎng diǎn yī pán gōngbǎo jīdīng hé liǎng wǎn mǐfàn.
I would like to order a plate of Kung Pao chicken and two bowls of rice.

这个菜味道怎么样？有点辣吗？
Zhège cài wèidào zěnmeyàng? Yǒudiǎn là ma?
How does this dish taste? Is it a bit spicy?

买单，一共多少钱？
Mǎidān, yīgòng duōshǎo qián?
Check please, how much is the total?

[Airport]
请 32 号登机的乘客前往登机口。
Qǐng sānshí'èr hào dēngjī de chéngkè qiánwǎng dēngjī kǒu.
Passengers for boarding flight gate 32 please proceed to the boarding gate.

我的行李箱需要在托运柜台办理过磅。
Wǒ de xínglǐxiāng xūyào zài tuōyùn guìtái bànlǐ guòbàng.
My suitcase needs to be weighed at the check-in counter.

飞往北京的航班即将准时起飞。
Fēi wǎng Běijīng de hángbān jíjiāng zhǔnshí qǐfēi.
The flight to Beijing is about to take off on time.

[Street]
请问去最近的地铁站怎么走？
Qǐngwèn qù zuìjìn de dìtiězhàn zěnme zǒu?
Excuse me, how do I get to the nearest subway station?

一直往前走，在第二个路口向右拐。
Yīzhí wǎng qián zǒu, zài dì-èr gè lùkǒu xiàng yòu guǎi.
Go straight ahead and turn right at the second intersection.

走路大概只需要十分钟左右。
Zǒulù dàgài zhǐ xūyào shí fēnzhōng zuǒyòu.
Walking takes approximately only ten minutes.

[Library]
我想借几本关于中文口语的书。
Wǒ xiǎng jiè jǐ běn guānyú zhōngwén kǒuyǔ de shū.
I want to borrow a few books about spoken Chinese.

请保持安静，不要在阅览室大声说话。
Qǐng bǎochí ānjìng, bùyào zài yuèlǎnshì dàshēng shuōhuà.
Please keep quiet and do not speak loudly in the reading room.

[Park]
这里的风景真美丽，空气很清新。
Zhèlǐ de fēngjǐng zhēn měilì, kōngqì hěn qīngxīn.
The scenery here is truly beautiful, and the air is very fresh.

许多人在湖边散步和练习太极拳。
Xǔduō rén zài hú biān sànbù hé liànxí tàijíquán.
Many people are walking by the lake and practicing Tai Chi.

[Supermarket]
新鲜的苹果和香蕉怎么卖？
Xīnxian de píngguǒ hé xiāngjiāo zěnme mài?
How much are the fresh apples and bananas sold for?

我可以用手机扫码支付吗？
Wǒ kěyǐ yòng shǒujī sǎomǎ zhīfù ma?
Can I use my mobile phone to scan and pay?

[Home]
今天晚上我打算在家自己做饭。
Jīntiān wǎnshang wǒ dǎsuàn zài jiā zìjǐ zuò fàn.
Tonight I plan to cook dinner myself at home.

吃完饭后我要听音乐和复习生词。
Chī wán fàn hòu wǒ yào tīng yīnyuè hé fùxí shēngcí.
After eating, I will listen to music and review new vocabulary.

[Gym]
每周坚持锻炼身体能保持健康。
Měizhōu jiānchí duànliàn shēntǐ néng bǎochí jiànkāng.
Exercising consistently every week can maintain good health.

跑步机上已经跑了五公里了。
Pǎobùjī shàng yǐjīng pǎo le wǔ gōnglǐ le.
I have already run five kilometers on the treadmill.

[Hospital]
医生，我最近感觉有点头晕咳嗽。
Yīshēng, wǒ zuìjìn gǎnjué yǒudiǎn tóu-yūn késòu.
Doctor, recently I feel a bit dizzy and have a cough.

请先去测一下体温和血压。
Qǐng xiān qù cè yīxià tǐwēn hé xuèyā.
Please go measure your temperature and blood pressure first.

[Classroom]
老师，这句话我没有听懂，请再讲一遍。
Lǎoshī, zhè jù huà wǒ méiyǒu tīng dǒng, qǐng zài jiǎng yībiàn.
Teacher, I didn't understand this sentence, please explain it once more.

只要每天坚持练习，就一定能说流利中文。
Zhǐyào měitiān jiānchí liànxí, jiù yīdìng néng shuō liúlì zhōngwén.
As long as you practice consistently every day, you will definitely speak fluent Chinese.`,
  },
];
