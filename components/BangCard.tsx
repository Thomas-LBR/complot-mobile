import React from 'react';
import { Pressable, View } from 'react-native';
import Text from './Text';
import { BangCard as CardData, SUITS, rank } from '../game/bang';
import { serif, sansBold } from '../game/theme';
const symbols:Record<string,string>={bang:'✦',missed:'↪',beer:'♡',saloon:'✚',stagecoach:'▣',wells:'▣',market:'◇',panic:'↗',cat:'✕',gatling:'✹',indians:'➶',duel:'⚔',barrel:'◉',jail:'▥',dynamite:'✷',mustang:'♞',scope:'⊕',volcanic:'⌖',schofield:'⌖',remington:'⌖',carabine:'⌖',winchester:'⌖'};
export default function BangCard({card,hidden=false,selected=false,onPress,small=false}:{card:CardData;hidden?:boolean;selected?:boolean;onPress?:()=>void;small?:boolean}){
 const blue=['equipment','weapon'].includes(card.category),red=['hearts','diamonds'].includes(card.suit);
 return <Pressable accessibilityRole="button" accessibilityLabel={hidden?'Carte cachée':card.name+' '+rank(card.rank)+SUITS[card.suit]} disabled={!onPress||hidden} onPress={onPress} style={({pressed})=>({width:small?90:116,height:small?132:164,padding:6,borderRadius:10,borderWidth:2,borderColor:selected?'#F4CF7A':blue?'#54819B':'#996B40',backgroundColor:hidden?'#433023':'#ECDCBB',transform:[{translateY:selected?-6:0},{scale:pressed?.96:1}],opacity:pressed?.85:1})}>
 {hidden?<View style={{flex:1,borderWidth:1,borderColor:'#8A6946',borderRadius:5,alignItems:'center',justifyContent:'center'}}><Text style={{color:'#D4B27A',fontFamily:serif,fontSize:24}}>BANG!</Text><Text style={{color:'#9E7C51',fontSize:30}}>✦</Text></View>:<>
 <View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{color:red?'#A33327':'#35291F',fontFamily:sansBold,fontSize:12}}>{rank(card.rank)}{SUITS[card.suit]}</Text><Text style={{color:blue?'#315B70':'#765339',fontSize:8}}>{blue?'EN JEU':'ACTION'}</Text></View>
 <Text numberOfLines={2} style={{color:'#352619',textAlign:'center',fontFamily:sansBold,fontSize:small?10:12,marginTop:4}}>{card.name}</Text>
 <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text style={{fontSize:small?30:42,color:blue?'#426A7C':'#9A492D'}}>{symbols[card.type]||'✦'}</Text></View>
 <Text numberOfLines={small?2:3} style={{fontSize:small?8:9,color:'#66513A',textAlign:'center',lineHeight:small?11:12}}>{card.description}</Text>
 </>}
 </Pressable>;
}
