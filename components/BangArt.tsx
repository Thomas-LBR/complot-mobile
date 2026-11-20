import React from 'react';
import { illustrations } from './BangIllustrations';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

/** Original vector illustrations: crisp on web and Expo, no image downloads. */
export default function BangArt({ kind = 'hat', size = 64 }: { kind?: string; size?: number }) {
  const ink = '#493022', cream = '#FFF2CF', orange = '#DD743B', teal = '#408B83';
  const gun = kind === 'bang';
  return <Svg width={size} height={size} viewBox="0 0 100 100" accessible={false}>
    <Ellipse cx="50" cy="86" rx="32" ry="5" fill="#493022" opacity=".12"/>
    <G stroke={ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      {illustrations[kind] || (gun ? <><Path d="M20 38H75V51H49L37 76H24L32 51H20Z" fill={orange}/><Rect x="47" y="34" width="35" height="15" rx="3" fill={teal}/><Path d="M42 51V61H54L60 50M66 34V28M75 34V28" fill="none"/><Circle cx="44" cy="43" r="5" fill={cream}/><Path d="M88 26L92 19M90 42L97 40M85 58L92 63" stroke="#E6A936"/></> :
      kind === 'beer' ? <><Path d="M32 25H64V78Q49 86 32 78Z" fill="#E6A936"/><Path d="M64 39H77V65H64" fill="none"/><Path d="M29 29C22 17 37 14 42 20C46 9 60 14 59 20C74 15 78 31 64 34H32Z" fill={cream}/><Path d="M42 42V69M53 42V69" stroke="#FFF2CF"/></> :
      ['mustang'].includes(kind) ? <><Path d="M26 80L32 47L25 33L44 23L47 13L56 26L72 38L80 59L65 66L53 54L58 80Z" fill={orange}/><Path d="M44 23L38 45L37 69M65 46L76 49" fill="none"/><Circle cx="59" cy="39" r="2" fill={ink}/><Path d="M28 74H58" stroke={teal} strokeWidth="7"/></> :
      kind === 'barrel' ? <><Path d="M29 24Q50 16 71 24L76 76Q50 88 24 76Z" fill="#C28B51"/><Path d="M32 27L30 73M47 25V78M63 27L68 73" fill="none"/><Path d="M27 37H73M25 65H75" stroke={teal} strokeWidth="10"/></> :
      kind === 'dynamite' ? <><Path d="M49 25C39 8 69 9 66 23" fill="none"/><Path d="M72 13L78 7M77 25H86" stroke="#E6A936"/><Rect x="28" y="27" width="16" height="50" rx="6" fill={orange}/><Rect x="44" y="25" width="16" height="56" rx="6" fill="#CA5343"/><Rect x="60" y="29" width="16" height="48" rx="6" fill={orange}/><Path d="M27 45H77M27 62H77" stroke={cream} strokeWidth="6"/></> :
      kind === 'scope' ? <><Circle cx="50" cy="47" r="28" fill={teal}/><Circle cx="50" cy="47" r="17" fill={cream}/><Path d="M50 12V34M50 61V83M15 47H36M64 47H85" fill="none"/></> :
      kind === 'cactus' ? <><Circle cx="73" cy="23" r="15" fill="#F0BC50" stroke="none"/><Path d="M43 82V24Q43 12 55 16Q61 18 61 27V47H70V34Q80 26 83 36V49Q83 61 61 61V82Z" fill={teal}/><Path d="M43 43H30V32Q20 25 18 35V46Q18 58 43 58M51 27V72" fill={teal}/><Path d="M20 83H81"/></> :
      <><Path d="M24 56L31 24Q38 18 49 30Q63 17 70 27L77 58Z" fill="#E6A936"/><Path d="M27 49Q50 60 74 49L77 60H24Z" fill={orange}/><Path d="M11 58Q47 75 88 56Q94 76 52 80Q10 80 11 58Z" fill="#E6A936"/></>)}
    </G>
  </Svg>;
}
