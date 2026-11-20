import React from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

export default function TimebombArt({ size=120, color='#F4D068', kind='bomb' }: {size?:number;color?:string;kind?:'bomb'|'clock'|'pliers'}) {
 return <Svg width={size} height={size} viewBox="0 0 120 120" accessible={false}>
  <G stroke="#142E39" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
   {kind==='clock'?<><Rect x="46" y="8" width="28" height="13" rx="4" fill={color}/><Circle cx="60" cy="66" r="43" fill={color}/><Circle cx="60" cy="66" r="33" fill="#F8F0D6"/><Path d="M60 41V66L77 53M60 36V39M30 66H33M60 93V96M87 66H90" fill="none"/><Circle cx="60" cy="66" r="3" fill="#142E39"/></>:
   kind==='pliers'?<><Path d="M44 54L29 19L45 14L60 40L75 14L91 19L76 54L65 67L79 97Q78 110 65 108L55 76L45 107Q32 111 28 99L44 62Z" fill={color}/><Path d="M44 54L76 54M54 76L65 67" fill="none"/><Circle cx="59" cy="56" r="6" fill="#F8F0D6"/></>:
   <><Path d="M66 30C53 7 94 8 91 26" fill="none" stroke="#F4D068"/><Path d="M99 16L106 9M101 30L112 32" stroke={color}/><Rect x="45" y="29" width="29" height="14" rx="4" fill={color} transform="rotate(12 60 35)"/><Circle cx="58" cy="72" r="36" fill="#284A56"/><Path d="M35 59Q42 46 54 48" stroke="#83A9B1" fill="none"/><Path d="M66 52L51 76H64L54 93L80 67H65L78 52Z" fill={color} strokeWidth="2"/></>}
  </G>
 </Svg>;
}
