import React from 'react';
import { Pressable, View } from 'react-native';
import Text from './Text';
import BangArt from './BangArt';
import { BangCard as CardData, SUITS, rank } from '../game/bang';
import { serif, sansBold } from '../game/theme';
export default function BangCard({card,hidden=false,selected=false,onPress,small=false,compact=false,expanded=false}:{card:CardData;hidden?:boolean;selected?:boolean;onPress?:()=>void;small?:boolean;compact?:boolean;expanded?:boolean}){
 const blue=['equipment','weapon'].includes(card.category),red=['hearts','diamonds'].includes(card.suit);
 return <Pressable accessibilityRole="button" accessibilityState={{selected}} accessibilityLabel={hidden?'Carte cachée':card.name+' '+rank(card.rank)+SUITS[card.suit]} disabled={!onPress||hidden} onPress={onPress} style={({pressed})=>({width:expanded?150:compact?76:small?90:116,height:expanded?undefined:compact?112:small?132:164,minHeight:expanded?220:undefined,padding:6,borderRadius:12,borderWidth:selected?3:2,shadowColor:'#493022',shadowOffset:{width:0,height:selected?5:3},shadowOpacity:.25,shadowRadius:0,elevation:3,borderColor:selected?'#D66732':'#493022',backgroundColor:hidden?'#347B76':blue?'#E2F0E4':'#FFF5DB',transform:[{translateY:selected?-6:0},{scale:pressed?.96:1}],opacity:pressed?.85:1})}>
 {hidden?<View style={{flex:1,borderWidth:1,borderColor:'#E6C883',borderRadius:5,alignItems:'center',justifyContent:'center'}}><Text style={{color:'#FFF2CF',fontFamily:serif,fontSize:24}}>BANG!</Text><Text style={{color:'#F2C358',fontSize:30}}>✦</Text></View>:<>
 <View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{color:red?'#A33327':'#35291F',fontFamily:sansBold,fontSize:12}}>{rank(card.rank)}{SUITS[card.suit]}</Text><Text style={{color:blue?'#315B70':'#765339',fontSize:8}}>{blue?'EN JEU':'ACTION'}</Text></View>
 <Text numberOfLines={2} style={{color:'#352619',textAlign:'center',fontFamily:sansBold,fontSize:compact?9:small?10:12,marginTop:4}}>{card.name}</Text>
 <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><BangArt kind={card.type} size={compact?40:small?52:76}/></View>
 <Text numberOfLines={expanded?undefined:compact?2:small?2:3} style={{fontSize:expanded?13:compact?7:small?8:9,color:'#66513A',textAlign:'center',lineHeight:expanded?19:compact?9:small?11:12}}>{card.description}</Text>
 </>}
 </Pressable>;
}
