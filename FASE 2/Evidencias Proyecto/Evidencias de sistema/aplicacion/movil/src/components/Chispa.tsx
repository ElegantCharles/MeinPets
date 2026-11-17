import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

export type ChispaPose = 'vacio' | 'tranquila' | 'sinConexion' | 'buscando' | 'calendario' | 'cargando';

const vacio = (
  <>
    <Path d="M132 174C150 174 164 160 160 140" fill="none" stroke={colors.ink} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M132 174C150 174 164 160 160 140" fill="none" stroke={colors.teal} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M66 192C58 160 66 126 100 126S142 160 134 192Z" fill={colors.surface} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Ellipse cx="100" cy="172" rx="17" ry="18" fill={colors.mint} />
    <Ellipse cx="80" cy="190" rx="15" ry="8" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Ellipse cx="120" cy="190" rx="15" ry="8" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Path d="M74 127Q100 142 126 127" fill="none" stroke={colors.ink} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M74 127Q100 142 126 127" fill="none" stroke={colors.teal} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="100" cy="145" r="9.5" fill={colors.surface} stroke={colors.ink} strokeWidth="3" />
    <G fill={colors.teal} transform="translate(94 138.6) scale(0.5)">
    <Circle cx="5.5" cy="11" r="2.2" />
    <Circle cx="9.5" cy="6.5" r="2.2" />
    <Circle cx="14.5" cy="6.5" r="2.2" />
    <Circle cx="18.5" cy="11" r="2.2" />
    <Path d="M12 12.5c-3 0-5.5 2.4-5.5 4.6 0 1.7 1.4 2.4 2.8 2.4.9 0 1.7-.4 2.7-.4s1.8.4 2.7.4c1.4 0 2.8-.7 2.8-2.4 0-2.2-2.5-4.6-5.5-4.6z" />
    </G>
    <Path d="M75 144L68 170" fill="none" stroke={colors.ink} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M75 144L68 170" fill="none" stroke={colors.surface} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M126 142Q148 134 154 104" fill="none" stroke={colors.ink} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M126 142Q148 134 154 104" fill="none" stroke={colors.surface} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <G>
    <Path d="M62 62Q50 32 60 10Q86 20 94 44Z" fill={colors.teal} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Path d="M126 44Q160 32 174 66Q176 94 154 88Q150 64 130 58Z" fill={colors.teal} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Ellipse cx="100" cy="78" rx="48" ry="42" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Ellipse cx="121" cy="71" rx="17" ry="19" fill={colors.mint} />
    <Ellipse cx="100" cy="100" rx="27" ry="17" fill={colors.surface} />
    <Path d="M89 87Q100 81 111 87Q109 98 100 98Q91 98 89 87Z" fill={colors.ink} />
    <Circle cx="80" cy="100" r="1.7" fill={colors.ink} />
    <Circle cx="84" cy="106" r="1.7" fill={colors.ink} />
    <Circle cx="120" cy="100" r="1.7" fill={colors.ink} />
    <Circle cx="116" cy="106" r="1.7" fill={colors.ink} />
    <Ellipse cx="80" cy="72" rx="6" ry="8" fill={colors.ink} />
    <Circle cx="82" cy="69" r="2.2" fill={colors.surface} />
    <Ellipse cx="121" cy="72" rx="6" ry="8" fill={colors.ink} />
    <Circle cx="123" cy="69" r="2.2" fill={colors.surface} />
    <Path d="M87 101Q100 124 113 101Z" fill={colors.ink} stroke={colors.ink} strokeWidth="3" strokeLinejoin="round" />
    <Ellipse cx="100" cy="112" rx="5.5" ry="4" fill={colors.mint} />
    </G>
    <Path d="M168 88Q174 96 171 106" fill="none" stroke={colors.teal} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M178 80Q188 96 181 112" fill="none" stroke={colors.teal} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <G transform="translate(36 180)">
    <Circle r="15" fill={colors.ball} stroke={colors.ink} strokeWidth="4" />
    <Path d="M-9 -10Q-1 0 -8 11" fill="none" stroke={colors.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 -10Q1 0 8 11" fill="none" stroke={colors.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </G>
  </>
);

const tranquila = (
  <>
    <Path d="M132 174C150 174 164 160 160 140" fill="none" stroke={colors.ink} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M132 174C150 174 164 160 160 140" fill="none" stroke={colors.teal} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M66 192C58 160 66 126 100 126S142 160 134 192Z" fill={colors.surface} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Ellipse cx="100" cy="172" rx="17" ry="18" fill={colors.mint} />
    <Ellipse cx="80" cy="190" rx="15" ry="8" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Ellipse cx="120" cy="190" rx="15" ry="8" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Path d="M74 127Q100 142 126 127" fill="none" stroke={colors.ink} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M74 127Q100 142 126 127" fill="none" stroke={colors.teal} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="100" cy="145" r="9.5" fill={colors.surface} stroke={colors.ink} strokeWidth="3" />
    <G fill={colors.teal} transform="translate(94 138.6) scale(0.5)">
    <Circle cx="5.5" cy="11" r="2.2" />
    <Circle cx="9.5" cy="6.5" r="2.2" />
    <Circle cx="14.5" cy="6.5" r="2.2" />
    <Circle cx="18.5" cy="11" r="2.2" />
    <Path d="M12 12.5c-3 0-5.5 2.4-5.5 4.6 0 1.7 1.4 2.4 2.8 2.4.9 0 1.7-.4 2.7-.4s1.8.4 2.7.4c1.4 0 2.8-.7 2.8-2.4 0-2.2-2.5-4.6-5.5-4.6z" />
    </G>
    <Path d="M75 144L90 166" fill="none" stroke={colors.ink} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M75 144L90 166" fill="none" stroke={colors.surface} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M125 144L110 166" fill="none" stroke={colors.ink} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M125 144L110 166" fill="none" stroke={colors.surface} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <G>
    <Path d="M62 62Q50 32 60 10Q86 20 94 44Z" fill={colors.teal} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Path d="M126 44Q160 32 174 66Q176 94 154 88Q150 64 130 58Z" fill={colors.teal} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Ellipse cx="100" cy="78" rx="48" ry="42" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Ellipse cx="121" cy="71" rx="17" ry="19" fill={colors.mint} />
    <Ellipse cx="100" cy="100" rx="27" ry="17" fill={colors.surface} />
    <Path d="M89 87Q100 81 111 87Q109 98 100 98Q91 98 89 87Z" fill={colors.ink} />
    <Circle cx="80" cy="100" r="1.7" fill={colors.ink} />
    <Circle cx="84" cy="106" r="1.7" fill={colors.ink} />
    <Circle cx="120" cy="100" r="1.7" fill={colors.ink} />
    <Circle cx="116" cy="106" r="1.7" fill={colors.ink} />
    <Ellipse cx="80" cy="72" rx="6" ry="8" fill={colors.ink} />
    <Circle cx="82" cy="69" r="2.2" fill={colors.surface} />
    <Ellipse cx="121" cy="72" rx="6" ry="8" fill={colors.ink} />
    <Circle cx="123" cy="69" r="2.2" fill={colors.surface} />
    <Path d="M70 60L86 55" fill="none" stroke={colors.ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M131 55L115 60" fill="none" stroke={colors.ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M100 97V101" fill="none" stroke={colors.ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M91 106Q95.5 101 100 106T109 106" fill="none" stroke={colors.ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </G>
    <G transform="translate(36 180)">
    <Circle r="15" fill={colors.ball} stroke={colors.ink} strokeWidth="4" />
    <Path d="M-9 -10Q-1 0 -8 11" fill="none" stroke={colors.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 -10Q1 0 8 11" fill="none" stroke={colors.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </G>
  </>
);

const sinConexion = (
  <>
    <Path d="M2 116Q14 158 54 164" fill="none" stroke={colors.ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M198 116Q186 158 146 164" fill="none" stroke={colors.ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M132 174C150 174 164 160 160 140" fill="none" stroke={colors.ink} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M132 174C150 174 164 160 160 140" fill="none" stroke={colors.teal} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M66 192C58 160 66 126 100 126S142 160 134 192Z" fill={colors.surface} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Ellipse cx="100" cy="172" rx="17" ry="18" fill={colors.mint} />
    <Ellipse cx="80" cy="190" rx="15" ry="8" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Ellipse cx="120" cy="190" rx="15" ry="8" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Path d="M74 127Q100 142 126 127" fill="none" stroke={colors.ink} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M74 127Q100 142 126 127" fill="none" stroke={colors.teal} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="100" cy="145" r="9.5" fill={colors.surface} stroke={colors.ink} strokeWidth="3" />
    <G fill={colors.teal} transform="translate(94 138.6) scale(0.5)">
    <Circle cx="5.5" cy="11" r="2.2" />
    <Circle cx="9.5" cy="6.5" r="2.2" />
    <Circle cx="14.5" cy="6.5" r="2.2" />
    <Circle cx="18.5" cy="11" r="2.2" />
    <Path d="M12 12.5c-3 0-5.5 2.4-5.5 4.6 0 1.7 1.4 2.4 2.8 2.4.9 0 1.7-.4 2.7-.4s1.8.4 2.7.4c1.4 0 2.8-.7 2.8-2.4 0-2.2-2.5-4.6-5.5-4.6z" />
    </G>
    <Path d="M75 144L64 160" fill="none" stroke={colors.ink} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M75 144L64 160" fill="none" stroke={colors.surface} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M125 144L136 160" fill="none" stroke={colors.ink} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M125 144L136 160" fill="none" stroke={colors.surface} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <G>
    <Path d="M62 62Q50 32 60 10Q86 20 94 44Z" fill={colors.teal} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Path d="M126 44Q160 32 174 66Q176 94 154 88Q150 64 130 58Z" fill={colors.teal} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Ellipse cx="100" cy="78" rx="48" ry="42" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Ellipse cx="121" cy="71" rx="17" ry="19" fill={colors.mint} />
    <Ellipse cx="100" cy="100" rx="27" ry="17" fill={colors.surface} />
    <Path d="M89 87Q100 81 111 87Q109 98 100 98Q91 98 89 87Z" fill={colors.ink} />
    <Circle cx="80" cy="100" r="1.7" fill={colors.ink} />
    <Circle cx="84" cy="106" r="1.7" fill={colors.ink} />
    <Circle cx="120" cy="100" r="1.7" fill={colors.ink} />
    <Circle cx="116" cy="106" r="1.7" fill={colors.ink} />
    <Ellipse cx="80" cy="72" rx="6" ry="8" fill={colors.ink} />
    <Circle cx="82" cy="69" r="2.2" fill={colors.surface} />
    <Ellipse cx="121" cy="72" rx="6" ry="8" fill={colors.ink} />
    <Circle cx="123" cy="69" r="2.2" fill={colors.surface} />
    <Path d="M70 60L86 55" fill="none" stroke={colors.ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M131 55L115 60" fill="none" stroke={colors.ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M100 97V101" fill="none" stroke={colors.ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M93 105H107" fill="none" stroke={colors.ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </G>
    <Rect x="54" y="154" width="18" height="20" rx="4" fill={colors.teal} stroke={colors.ink} strokeWidth="4" />
    <Path d="M72 159H80M72 169H80" fill="none" stroke={colors.ink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="128" y="154" width="18" height="20" rx="4" fill={colors.mint} stroke={colors.ink} strokeWidth="4" />
    <Path d="M100 148V142M92 152L88 147M108 152L112 147" fill="none" stroke={colors.teal} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <G transform="translate(36 180)">
    <Circle r="15" fill={colors.ball} stroke={colors.ink} strokeWidth="4" />
    <Path d="M-9 -10Q-1 0 -8 11" fill="none" stroke={colors.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 -10Q1 0 8 11" fill="none" stroke={colors.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </G>
  </>
);

const buscando = (
  <>
    <Path d="M132 174C150 174 164 160 160 140" fill="none" stroke={colors.ink} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M132 174C150 174 164 160 160 140" fill="none" stroke={colors.teal} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M66 192C58 160 66 126 100 126S142 160 134 192Z" fill={colors.surface} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Ellipse cx="100" cy="172" rx="17" ry="18" fill={colors.mint} />
    <Ellipse cx="80" cy="190" rx="15" ry="8" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Ellipse cx="120" cy="190" rx="15" ry="8" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Path d="M74 127Q100 142 126 127" fill="none" stroke={colors.ink} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M74 127Q100 142 126 127" fill="none" stroke={colors.teal} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="100" cy="145" r="9.5" fill={colors.surface} stroke={colors.ink} strokeWidth="3" />
    <G fill={colors.teal} transform="translate(94 138.6) scale(0.5)">
    <Circle cx="5.5" cy="11" r="2.2" />
    <Circle cx="9.5" cy="6.5" r="2.2" />
    <Circle cx="14.5" cy="6.5" r="2.2" />
    <Circle cx="18.5" cy="11" r="2.2" />
    <Path d="M12 12.5c-3 0-5.5 2.4-5.5 4.6 0 1.7 1.4 2.4 2.8 2.4.9 0 1.7-.4 2.7-.4s1.8.4 2.7.4c1.4 0 2.8-.7 2.8-2.4 0-2.2-2.5-4.6-5.5-4.6z" />
    </G>
    <Path d="M75 144L68 170" fill="none" stroke={colors.ink} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M75 144L68 170" fill="none" stroke={colors.surface} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M126 144L150 130" fill="none" stroke={colors.ink} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M126 144L150 130" fill="none" stroke={colors.surface} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <G>
    <Path d="M62 62Q50 32 60 10Q86 20 94 44Z" fill={colors.teal} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Path d="M126 44Q160 32 174 66Q176 94 154 88Q150 64 130 58Z" fill={colors.teal} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Ellipse cx="100" cy="78" rx="48" ry="42" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Ellipse cx="121" cy="71" rx="17" ry="19" fill={colors.mint} />
    <Ellipse cx="100" cy="100" rx="27" ry="17" fill={colors.surface} />
    <Path d="M89 87Q100 81 111 87Q109 98 100 98Q91 98 89 87Z" fill={colors.ink} />
    <Circle cx="80" cy="100" r="1.7" fill={colors.ink} />
    <Circle cx="84" cy="106" r="1.7" fill={colors.ink} />
    <Circle cx="120" cy="100" r="1.7" fill={colors.ink} />
    <Circle cx="116" cy="106" r="1.7" fill={colors.ink} />
    <Ellipse cx="82" cy="72" rx="6" ry="8" fill={colors.ink} />
    <Circle cx="84" cy="69" r="2.2" fill={colors.surface} />
    <Ellipse cx="123" cy="72" rx="6" ry="8" fill={colors.ink} />
    <Circle cx="125" cy="69" r="2.2" fill={colors.surface} />
    <Path d="M100 97V102" fill="none" stroke={colors.ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M88 103Q100 114 112 103" fill="none" stroke={colors.ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </G>
    <Path d="M152 128L160 114" fill="none" stroke={colors.ink} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="169" cy="98" r="18" fill={colors.surface} stroke={colors.ink} strokeWidth="5" />
    <Path d="M160 94A10 10 0 0 1 169 88" fill="none" stroke={colors.teal} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <G transform="translate(36 180)">
    <Circle r="15" fill={colors.ball} stroke={colors.ink} strokeWidth="4" />
    <Path d="M-9 -10Q-1 0 -8 11" fill="none" stroke={colors.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 -10Q1 0 8 11" fill="none" stroke={colors.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </G>
  </>
);

const calendario = (
  <>
    <Path d="M132 174C150 174 164 160 160 140" fill="none" stroke={colors.ink} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M132 174C150 174 164 160 160 140" fill="none" stroke={colors.teal} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M66 192C58 160 66 126 100 126S142 160 134 192Z" fill={colors.surface} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Ellipse cx="100" cy="172" rx="17" ry="18" fill={colors.mint} />
    <Ellipse cx="80" cy="190" rx="15" ry="8" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Ellipse cx="120" cy="190" rx="15" ry="8" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Path d="M74 127Q100 142 126 127" fill="none" stroke={colors.ink} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M74 127Q100 142 126 127" fill="none" stroke={colors.teal} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="100" cy="145" r="9.5" fill={colors.surface} stroke={colors.ink} strokeWidth="3" />
    <G fill={colors.teal} transform="translate(94 138.6) scale(0.5)">
    <Circle cx="5.5" cy="11" r="2.2" />
    <Circle cx="9.5" cy="6.5" r="2.2" />
    <Circle cx="14.5" cy="6.5" r="2.2" />
    <Circle cx="18.5" cy="11" r="2.2" />
    <Path d="M12 12.5c-3 0-5.5 2.4-5.5 4.6 0 1.7 1.4 2.4 2.8 2.4.9 0 1.7-.4 2.7-.4s1.8.4 2.7.4c1.4 0 2.8-.7 2.8-2.4 0-2.2-2.5-4.6-5.5-4.6z" />
    </G>
    <Path d="M75 144L68 170" fill="none" stroke={colors.ink} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M75 144L68 170" fill="none" stroke={colors.surface} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M125 144L132 170" fill="none" stroke={colors.ink} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M125 144L132 170" fill="none" stroke={colors.surface} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <G transform="rotate(9 100 118)">
    <Path d="M62 62Q50 32 60 10Q86 20 94 44Z" fill={colors.teal} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Path d="M126 44Q160 32 174 66Q176 94 154 88Q150 64 130 58Z" fill={colors.teal} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Ellipse cx="100" cy="78" rx="48" ry="42" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Ellipse cx="121" cy="71" rx="17" ry="19" fill={colors.mint} />
    <Ellipse cx="100" cy="100" rx="27" ry="17" fill={colors.surface} />
    <Path d="M89 87Q100 81 111 87Q109 98 100 98Q91 98 89 87Z" fill={colors.ink} />
    <Circle cx="80" cy="100" r="1.7" fill={colors.ink} />
    <Circle cx="84" cy="106" r="1.7" fill={colors.ink} />
    <Circle cx="120" cy="100" r="1.7" fill={colors.ink} />
    <Circle cx="116" cy="106" r="1.7" fill={colors.ink} />
    <Path d="M73 71Q80 79 87 71" fill="none" stroke={colors.ink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M114 71Q121 79 128 71" fill="none" stroke={colors.ink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M100 97V101" fill="none" stroke={colors.ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M94 104Q100 109 106 104" fill="none" stroke={colors.ink} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </G>
    <Path d="M150 36h12l-12 13h12" fill="none" stroke={colors.teal} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M170 14h9l-9 10h9" fill="none" stroke={colors.teal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <G transform="translate(36 180)">
    <Circle r="15" fill={colors.ball} stroke={colors.ink} strokeWidth="4" />
    <Path d="M-9 -10Q-1 0 -8 11" fill="none" stroke={colors.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 -10Q1 0 8 11" fill="none" stroke={colors.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </G>
  </>
);

const cargando = (
  <>
    <G transform="translate(-16 -10) rotate(8 100 190)">
    <Path d="M6 112H28M2 134H22M10 156H26" fill="none" stroke={colors.teal} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M132 174C150 174 164 160 160 140" fill="none" stroke={colors.ink} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M132 174C150 174 164 160 160 140" fill="none" stroke={colors.teal} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M66 192C58 160 66 126 100 126S142 160 134 192Z" fill={colors.surface} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Ellipse cx="100" cy="172" rx="17" ry="18" fill={colors.mint} />
    <Ellipse cx="80" cy="190" rx="15" ry="8" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Ellipse cx="120" cy="190" rx="15" ry="8" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Path d="M74 127Q100 142 126 127" fill="none" stroke={colors.ink} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M74 127Q100 142 126 127" fill="none" stroke={colors.teal} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="100" cy="145" r="9.5" fill={colors.surface} stroke={colors.ink} strokeWidth="3" />
    <G fill={colors.teal} transform="translate(94 138.6) scale(0.5)">
    <Circle cx="5.5" cy="11" r="2.2" />
    <Circle cx="9.5" cy="6.5" r="2.2" />
    <Circle cx="14.5" cy="6.5" r="2.2" />
    <Circle cx="18.5" cy="11" r="2.2" />
    <Path d="M12 12.5c-3 0-5.5 2.4-5.5 4.6 0 1.7 1.4 2.4 2.8 2.4.9 0 1.7-.4 2.7-.4s1.8.4 2.7.4c1.4 0 2.8-.7 2.8-2.4 0-2.2-2.5-4.6-5.5-4.6z" />
    </G>
    <Path d="M76 146L60 164" fill="none" stroke={colors.ink} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M76 146L60 164" fill="none" stroke={colors.surface} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M126 146L156 152" fill="none" stroke={colors.ink} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M126 146L156 152" fill="none" stroke={colors.surface} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <G>
    <Path d="M62 62Q50 32 60 10Q86 20 94 44Z" fill={colors.teal} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Path d="M126 44Q160 32 174 66Q176 94 154 88Q150 64 130 58Z" fill={colors.teal} stroke={colors.ink} strokeWidth="4" strokeLinejoin="round" />
    <Ellipse cx="100" cy="78" rx="48" ry="42" fill={colors.surface} stroke={colors.ink} strokeWidth="4" />
    <Ellipse cx="121" cy="71" rx="17" ry="19" fill={colors.mint} />
    <Ellipse cx="100" cy="100" rx="27" ry="17" fill={colors.surface} />
    <Path d="M89 87Q100 81 111 87Q109 98 100 98Q91 98 89 87Z" fill={colors.ink} />
    <Circle cx="80" cy="100" r="1.7" fill={colors.ink} />
    <Circle cx="84" cy="106" r="1.7" fill={colors.ink} />
    <Circle cx="120" cy="100" r="1.7" fill={colors.ink} />
    <Circle cx="116" cy="106" r="1.7" fill={colors.ink} />
    <Ellipse cx="83" cy="72" rx="6" ry="8" fill={colors.ink} />
    <Circle cx="85" cy="69" r="2.2" fill={colors.surface} />
    <Ellipse cx="124" cy="72" rx="6" ry="8" fill={colors.ink} />
    <Circle cx="126" cy="69" r="2.2" fill={colors.surface} />
    <Path d="M87 101Q100 124 113 101Z" fill={colors.ink} stroke={colors.ink} strokeWidth="3" strokeLinejoin="round" />
    <Ellipse cx="100" cy="112" rx="5.5" ry="4" fill={colors.mint} />
    </G>
    </G>
    <G transform="translate(182 180)">
    <Circle r="15" fill={colors.ball} stroke={colors.ink} strokeWidth="4" />
    <Path d="M-9 -10Q-1 0 -8 11" fill="none" stroke={colors.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 -10Q1 0 8 11" fill="none" stroke={colors.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </G>
  </>
);

const POSES: Record<ChispaPose, React.ReactElement> = { vacio, tranquila, sinConexion, buscando, calendario, cargando };

export function Chispa({ pose, size = 180 }: { pose: ChispaPose; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {POSES[pose]}
    </Svg>
  );
}
