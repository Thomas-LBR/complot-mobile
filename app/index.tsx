import React from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../components/Text';
import InstallApp from '../components/InstallApp';
import BangArt from '../components/BangArt';
import TimebombArt from '../components/TimebombArt';
import { Emblem } from '../components/Visuals';
import { useEngine } from '../game/EngineContext';
import { sansBold, serif } from '../game/theme';

const games = [
 {id:'complot',title:'Complot',tag:'LE POUVOIR A SES SECRETS',players:'2–8 joueurs',description:'Deux influences, des pièces et beaucoup de culot. Bluffez pour prendre le contrôle de la table.',colors:['#254F3C','#142E28'] as const,accent:'#E4C784',route:'/complot' as const},
 {id:'bang',title:'BANG!',tag:'BIENVENUE AU SALOON',players:'4–7 joueurs',description:'Shérif, hors-la-loi ou renégat ? Sortez vos meilleures cartes et choisissez bien vos alliés.',colors:['#995834','#593826'] as const,accent:'#FFD67B',route:'/bang' as const},
 {id:'timebomb',title:'Time Bomb',tag:'LONDRES RETIENT SON SOUFFLE',players:'4–6 joueurs',description:'Sherlock contre Moriarty. Écoutez les autres, gardez votre camp secret et coupez le bon câble.',colors:['#265B6C','#173441'] as const,accent:'#9AE2D0',route:'/timebomb' as const},
 {id:'chateau',title:'Château Combo',tag:'LA FÊTE AU COMBO',players:'2–5 joueurs',description:'Recrutez neuf personnages, construisez votre cour et assemblez les blasons pour marquer le plus de points.',colors:['#536C58','#25433E'] as const,accent:'#F4D394',route:'/chateau' as const},
];
export default function Home(){const {width}=useWindowDimensions(),wide=width>=1000,params=useLocalSearchParams<{code?:string}>(),e=useEngine();
 // Preserve invitations generated before the three-game hub existed.
 if(params.code)return <Redirect href={{pathname:'/complot',params:{code:String(params.code)}}}/>;
 return <SafeAreaView style={s.page}><LinearGradient colors={['#1C3033','#111E24']} style={StyleSheet.absoluteFill}/><ScrollView contentContainerStyle={[s.container,{padding:wide?36:20}]}>
  <View style={s.header}><Text style={s.logo}>LA TABLE DES AMIS</Text><Text style={s.small}>PC & MOBILE · SANS COMPTE</Text></View>
  <View style={s.intro}><Text style={s.eyebrow}>QUATRE JEUX. UNE BANDE D’AMIS.</Text><Text accessibilityRole="header" style={[s.title,{fontSize:wide?66:45}]}>Ce soir, on joue{ '\n' }à quoi ?</Text><Text style={s.description}>Choisissez votre univers, créez une salle et partagez son code. Les alliances se font à table. Les trahisons aussi.</Text></View>
  {e.room&&<Pressable accessibilityRole="button" onPress={()=>router.push(e.room?.phase==='waiting'?'/lobby':'/game')} style={s.resume}><Text style={s.resumeText}>↗ Reprendre votre salle Complot · {e.room.code}</Text></Pressable>}
  <View style={{flexDirection:wide?'row':'column',flexWrap:'wrap',gap:18}}>{games.map(game=><Pressable key={game.id} accessibilityRole="button" accessibilityLabel={'Jouer à '+game.title} onPress={()=>router.push(game.route)} style={({pressed})=>({flexBasis:wide?'47%':undefined,transform:[{translateY:pressed?3:0}],opacity:pressed?.9:1})}>
   <LinearGradient colors={game.colors} style={[s.game,{borderColor:game.accent+'70'}]}><View style={s.gameTop}><Text style={[s.tag,{color:game.accent}]}>{game.tag}</Text><Text style={s.players}>{game.players}</Text></View>
    <View style={s.art}>{game.id==='complot'?<Emblem size={130}/>:game.id==='bang'?<View style={{flexDirection:'row',alignItems:'center'}}><BangArt kind="cactus" size={70}/><BangArt size={126}/><BangArt kind="beer" size={70}/></View>:game.id==='timebomb'?<TimebombArt kind="clock" size={140} color="#F4D068"/>:<Text style={{fontSize:110,color:'#F4D394'}}>♜</Text>}</View>
    <Text style={[s.gameTitle,{color:game.accent}]}>{game.title}</Text>{game.id==='timebomb'&&<Text style={[s.tag,{color:game.accent}]}>EVOLUTION · 2 MODES</Text>}<Text style={[s.description,{fontSize:13,lineHeight:22,minHeight:wide?88:undefined}]}>{game.description}</Text><View style={[s.play,{backgroundColor:game.accent}]}><Text style={s.playText}>Jouer à {game.title}   →</Text></View>
   </LinearGradient>
  </Pressable>)}</View>
  <InstallApp/>
  <View style={s.footer}><Text style={s.footerTitle}>Une salle privée, un code, c’est parti.</Text><Text style={s.small}>Les codes appartiennent à leur jeu. Pour reprendre Bang! ou Time Bomb, ouvrez simplement le jeu dans le même navigateur.</Text></View>
 </ScrollView></SafeAreaView>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:'#111E24'},container:{width:'100%',maxWidth:1320,alignSelf:'center',gap:24,paddingBottom:40},header:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:10,paddingVertical:10},logo:{fontFamily:sansBold,fontSize:13,letterSpacing:2,color:'#F4DEAD'},small:{fontSize:10,color:'#AFC3C4',lineHeight:18},intro:{gap:14,paddingVertical:22},eyebrow:{fontFamily:sansBold,fontSize:10,letterSpacing:2,color:'#C7B787'},title:{fontFamily:serif,color:'#FAF0D7',lineHeight:undefined},description:{fontSize:14,lineHeight:24,color:'#E3E7DE',maxWidth:570},game:{borderRadius:24,borderWidth:1,padding:22,gap:13},gameTop:{gap:8},tag:{fontFamily:sansBold,fontSize:9,letterSpacing:1.3},players:{color:'#FFF5DA',fontSize:12},art:{height:155,justifyContent:'center',alignItems:'center'},gameTitle:{fontFamily:serif,fontSize:44},play:{borderRadius:12,padding:15,marginTop:8},playText:{fontFamily:sansBold,color:'#203031',fontSize:13,textAlign:'center'},resume:{borderWidth:1,borderColor:'#C7B787',borderRadius:12,padding:16,backgroundColor:'#284338'},resumeText:{color:'#F4DEAD',fontFamily:sansBold,fontSize:12},footer:{alignItems:'center',gap:10,paddingVertical:24},footerTitle:{fontFamily:serif,fontSize:25,color:'#F4DEAD'}});
