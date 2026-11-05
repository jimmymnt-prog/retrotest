
'use strict';

(function injectPureListStyles(){
  if(document.getElementById('retro-pure-list-styles')) return;
  const s=document.createElement('style');
  s.id='retro-pure-list-styles';
  s.textContent=`
    #library{
      display:flex !important;
      flex-direction:column !important;
      gap:4px !important;
      padding:10px 12px !important;
      grid-template-columns:none !important;
      grid-auto-rows:auto !important;
      align-content:stretch !important;
    }
    .game-card,
    .game-img-wrap,
    .game-fallback,
    .game-genre-badge,
    .game-label{
      display:none !important;
    }
    .game-list-row{
      width:100%;
      min-height:40px;
      display:flex !important;
      align-items:center;
      justify-content:space-between;
      gap:16px;
      padding:7px 11px;
      margin:0;
      border:1px solid #1a2a3a;
      border-radius:7px;
      background:#121221;
      color:#d8e7f5;
      cursor:pointer;
      text-align:left;
      box-sizing:border-box;
    }
    .game-list-row:hover{
      background:#17263a;
      border-color:#23628e;
    }
    .game-list-title{
      flex:1;
      min-width:0;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
      font-size:13px;
      font-weight:600;
    }
    .game-list-console{
      flex:0 0 auto;
      font-size:10px;
      font-weight:800;
      text-transform:uppercase;
      color:#73c9ef;
      border:1px solid #24527a;
      background:#0b1b2a;
      border-radius:11px;
      padding:3px 7px;
    }
  `;
  document.head.appendChild(s);
})();


const EJS_CDN = 'https://cdn.emulatorjs.org/stable/data/';
const BUILTIN_CORE = 'segaMD';

function imgUrl(filename) { return new URL('images/' + filename, window.location.href).href; }

const LEGACY_GAMES = [
  // Platformers
  { title:'Sonic the Hedgehog 2',      file:'sonic the hedgehog 2 (world).bin',                                                         img:'Sonic The Hedgehog 2 (World).webp',                                                          genre:'platformer', emoji:'S' },
  { title:'Sonic the Hedgehog 3',      file:'sonic the hedgehog 3 (usa).bin',                                                           img:'Sonic The Hedgehog 3 (USA).webp',                                                            genre:'platformer', emoji:'S' },
  { title:'Sonic & Knuckles',          file:"sonic & knuckles (prototype 0619 - jun 19, 1994, 08.18).bin",                              img:'Sonic _ Knuckles (World).webp',                                                              genre:'platformer', emoji:'S' },
  { title:'Sonic Spinball',            file:'sonic spinball (usa).bin',                                                                  img:'Sonic Spinball (USA).webp',                                                                  genre:'platformer', emoji:'S' },
  { title:'Sonic 3D Blast',            file:"sonic 3d blast -- sonic 3d - flickies' island (euro, usa, kor).bin",                       img:"Sonic 3D Blast ~ Sonic 3D Flickies' Island (USA, Europe).webp",                              genre:'platformer', emoji:'S' },
  { title:'Earthworm Jim',             file:'earthworm jim (usa).bin',                                                                   img:'Earthworm Jim (USA).webp',                                                                   genre:'platformer', emoji:'J' },
  { title:'Earthworm Jim 2',           file:'earthworm jim 2 (usa).bin',                                                                 img:'Earthworm Jim 2 (USA).webp',                                                                 genre:'platformer', emoji:'J' },
  { title:'Aladdin',                   file:'aladdin (usa).bin',                                                                         img:'Aladdin (USA).webp',                                                                         genre:'platformer', emoji:'A' },
  { title:'The Lion King',             file:'the lion king (hack, spanish).bin',                                                         img:'Lion King, The (World).webp',                                                                genre:'platformer', emoji:'L' },
  { title:'Castle of Illusion',        file:'castle of illusion starring mickey mouse (euro, usa).bin',                                  img:'Castle of Illusion Starring Mickey Mouse (USA, Europe).webp',                                genre:'platformer', emoji:'C' },
  { title:'Pulseman',                  file:'pulseman (jpn).bin',                                                                        img:'Pulseman (Japan).webp',                                                                      genre:'platformer', emoji:'P' },
  { title:'Ristar',                    file:'ristar (euro, usa) (august 1994).bin',                                                      img:'Ristar (USA, Europe) (August 1994).webp',                                                    genre:'platformer', emoji:'R' },
  { title:'Kid Chameleon',             file:'kid chameleon (hack, spanish).bin',                                                         img:'Kid Chameleon (USA, Europe).webp',                                                           genre:'platformer', emoji:'K' },
  { title:'Dynamite Headdy',           file:'dynamite headdy (jpn).bin',                                                                 img:'Dynamite Headdy (Japan).webp',                                                               genre:'platformer', emoji:'D' },
  { title:'Bubsy',                     file:'bubsy in claws encounters of the furred kind (euro, usa).bin',                              img:'Bubsy in - Claws Encounters of the Furred Kind (USA, Europe).webp',                          genre:'platformer', emoji:'B' },
  { title:'Rocket Knight Adventures',  file:'rocket knight adventures (usa).bin',                                                        img:'Rocket Knight Adventures (USA).webp',                                                        genre:'platformer', emoji:'R' },
  { title:'Mickey Mania',              file:'mickey mania - the timeless adventures of mickey mouse (usa).bin',                          img:'Mickey Mania - The Timeless Adventures of Mickey Mouse (USA).webp',                          genre:'platformer', emoji:'M' },
  { title:'World of Illusion',         file:'world of illusion starring mickey mouse and donald duck (usa, kor).bin',                    img:'World of Illusion Starring Mickey Mouse and Donald Duck (USA, Korea).webp',                   genre:'platformer', emoji:'W' },
  { title:'QuackShot',                 file:'quackshot starring donald duck -- quackshot - guruzia ou no hihou (world) (alt).bin',       img:'QuackShot Starring Donald Duck ~ QuackShot - I Love Donald Duck - Guruzia Ou no Hihou (World).webp', genre:'platformer', emoji:'Q' },
  { title:'The Jungle Book',           file:'jungle book, the (usa).bin',                                                                img:'Jungle Book, The (USA).webp',                                                                genre:'platformer', emoji:'J' },
  { title:'Toy Story',                 file:'toy story (usa).bin',                                                                       img:'Toy Story (USA).webp',                                                                       genre:'platformer', emoji:'T' },
  { title:'Pinocchio',                 file:'pinocchio (usa).bin',                                                                       img:'Pinocchio (USA).webp',                                                                       genre:'platformer', emoji:'P' },
  // Beat em Ups
  { title:'Streets of Rage',           file:'streets of rage (hack, spanish).bin',                                                       img:'Bare Knuckle - Ikari no Tetsuken ~ Streets of Rage (World) (Rev A).webp',                    genre:'beat', emoji:'B' },
  { title:'Streets of Rage 2',         file:'streets of rage 2 (usa).bin',                                                               img:'Streets of Rage 2 (USA).webp',                                                               genre:'beat', emoji:'B' },
  { title:'Streets of Rage 3',         file:'streets of rage 3 (usa).bin',                                                               img:'Streets of Rage 3 (USA).webp',                                                               genre:'beat', emoji:'B' },
  { title:'Bare Knuckle III (JP)',      file:'bare knuckle iii (jpn).bin',                                                                img:'Bare Knuckle III (Japan).webp',                                                              genre:'beat', emoji:'B' },
  { title:'Golden Axe',                file:'golden axe (world) (v1.1).bin',                                                             img:'Golden Axe (World) (v1.1).webp',                                                             genre:'beat', emoji:'G' },
  { title:'Golden Axe II',             file:'golden axe ii (hack, spanish).bin',                                                         img:'Golden Axe II (World).webp',                                                                 genre:'beat', emoji:'G' },
  { title:'Golden Axe III',            file:'golden axe iii (euro).bin',                                                                 img:'Golden Axe III (Japan).webp',                                                                genre:'beat', emoji:'G' },
  { title:'Comix Zone',                file:'comix zone (usa).bin',                                                                      img:'Comix Zone (USA).webp',                                                                      genre:'beat', emoji:'C' },
  { title:'Altered Beast',             file:'altered beast (hack, spanish).bin',                                                         img:'Altered Beast (USA, Europe).webp',                                                           genre:'beat', emoji:'A' },
  { title:'Double Dragon',             file:'double dragon (euro, usa).bin',                                                              img:'Double Dragon (USA, Europe) (Unl).webp',                                                     genre:'beat', emoji:'D' },
  { title:'Battletoads',               file:'battletoads (world).bin',                                                                   img:'Battletoads (World).webp',                                                                   genre:'beat', emoji:'B' },
  { title:'TMNT: Hyperstone Heist',    file:'teenage mutant ninja turtles - the hyperstone heist (usa).bin',                             img:'Teenage Mutant Ninja Turtles - The Hyperstone Heist (USA).webp',                             genre:'beat', emoji:'T' },
  { title:'Power Rangers',             file:'mighty morphin power rangers (usa).bin',                                                     img:'Mighty Morphin Power Rangers (USA).webp',                                                    genre:'beat', emoji:'P' },
  { title:'Spider-Man: Max Carnage',   file:'spider-man and venom - maximum carnage (world).bin',                                        img:'Spider-Man . Venom - Maximum Carnage (World).webp',                                          genre:'beat', emoji:'S' },
  { title:'X-Men',                     file:'x-men (usa).bin',                                                                           img:'X-Men (USA).webp',                                                                           genre:'beat', emoji:'X' },
  { title:'X-Men 2: Clone Wars',       file:'x-men 2 - clone wars (euro, usa).bin',                                                     img:'X-Men 2 - Clone Wars (USA, Europe).webp',                                                    genre:'beat', emoji:'X' },
  { title:'The Punisher',              file:'punisher, the (usa).bin',                                                                   img:'Punisher, The (USA).webp',                                                                   genre:'beat', emoji:'P' },
  // Action
  { title:'Gunstar Heroes',            file:'gunstar heroes (usa).bin',                                                                  img:'Gunstar Heroes (USA).webp',                                                                  genre:'action', emoji:'G' },
  { title:'Contra: Hard Corps',        file:'contra - hard corps (usa, kor).bin',                                                        img:'Contra - Hard Corps (USA, Korea).webp',                                                      genre:'action', emoji:'C' },
  { title:'Alien Soldier',             file:'alien soldier (euro).bin',                                                                  img:'Alien Soldier (Europe).webp',                                                                genre:'action', emoji:'A' },
  { title:'Vectorman',                 file:'vectorman (euro, usa).bin',                                                                  img:'Vectorman (USA, Europe).webp',                                                               genre:'action', emoji:'V' },
  { title:'Vectorman 2',               file:'vectorman 2 (usa).bin',                                                                     img:'Vectorman 2 (USA).webp',                                                                     genre:'action', emoji:'V' },
  { title:'Ranger-X',                  file:'ranger-x (usa).bin',                                                                        img:'Ranger X (USA).webp',                                                                        genre:'action', emoji:'R' },
  { title:'Revenge of Shinobi',        file:'revenge of shinobi, the (euro, usa) (rev a).bin',                                          img:'Revenge of Shinobi, The (USA, Europe) (Rev A).webp',                                         genre:'action', emoji:'R' },
  { title:'Shadow Dancer',             file:'shadow dancer - the secret of shinobi (hack, spanish).bin',                                 img:'Shadow Dancer - The Secret of Shinobi (World).webp',                                         genre:'action', emoji:'S' },
  { title:'Shinobi III',               file:'shinobi iii - return of the ninja master (usa).bin',                                        img:'Shinobi III - Return of the Ninja Master (USA).webp',                                        genre:'action', emoji:'S' },
  { title:'Strider',                   file:'strider hiryuu (jpn, kor).bin',                                                             img:'Strider Hiryuu (Japan, Korea).webp',                                                         genre:'action', emoji:'S' },
  { title:'ToeJam & Earl',             file:'toe jam & earl (world).bin',                                                                img:'ToeJam _ Earl (World).webp',                                                                 genre:'action', emoji:'T' },
  { title:'Sunset Riders',             file:'sunset riders (usa).bin',                                                                   img:'Sunset Riders (USA).webp',                                                                   genre:'action', emoji:'S' },
  { title:'Batman',                    file:'batman (usa).bin',                                                                          img:'Batman - The Video Game (USA).webp',                                                         genre:'action', emoji:'B' },
  { title:'RoboCop vs Terminator',     file:'robocop versus the terminator (usa).bin',                                                   img:'RoboCop versus The Terminator (USA).webp',                                                   genre:'action', emoji:'R' },
  { title:'Ecco the Dolphin',          file:'ecco the dolphin (hack, spanish).bin',                                                      img:'Ecco the Dolphin (USA, Europe).webp',                                                        genre:'action', emoji:'E' },
  { title:'Flashback',                 file:'flashback - the quest for identity (usa).bin',                                              img:'Flashback - The Quest for Identity (USA).webp',                                              genre:'action', emoji:'F' },
  { title:'Castlevania: Bloodlines',   file:'castlevania - bloodlines (usa).bin',                                                        img:'Castlevania - Bloodlines (USA).webp',                                                        genre:'action', emoji:'C' },
  { title:'Mega Man: Wily Wars',       file:'mega man - the wily wars (usa).bin',                                                        img:'Mega Man - The Wily Wars (Europe).webp',                                                     genre:'action', emoji:'M' },
  { title:'Desert Strike',             file:'desert strike (euro, usa).bin',                                                             img:'Desert Strike - Return to the Gulf (USA, Europe).webp',                                      genre:'action', emoji:'D' },
  { title:'Jungle Strike',             file:'jungle strike (euro, usa).bin',                                                             img:'Jungle Strike (USA, Europe).webp',                                                           genre:'action', emoji:'J' },
  { title:'Urban Strike',              file:'urban strike (euro, usa).bin',                                                              img:'Urban Strike (USA, Europe).webp',                                                            genre:'action', emoji:'U' },
  { title:'Jurassic Park',             file:'jurassic park (usa).bin',                                                                   img:'Jurassic Park (USA).webp',                                                                   genre:'action', emoji:'J' },
  { title:'Jurassic Park: Rampage',    file:'jurassic park - rampage edition (euro, usa).bin',                                           img:'Jurassic Park - Rampage Edition (USA, Europe).webp',                                         genre:'action', emoji:'J' },
  { title:'Zombies Ate My Neighbors',  file:'zombies ate my neighbors (usa).bin',                                                        img:'Zombies Ate My Neighbors (USA).webp',                                                        genre:'action', emoji:'Z' },
  { title:'Lemmings',                  file:'lemmings (usa, jpn).bin',                                                                   img:'Lemmings (Japan, USA).webp',                                                                 genre:'action', emoji:'L' },
  // Fighting
  { title:'Mortal Kombat',             file:'mortal kombat (world) (v1.1).bin',                                                          img:'Mortal Kombat (World) (v1.1).webp',                                                          genre:'fighting', emoji:'M' },
  { title:'Mortal Kombat II',          file:'Mortal Kombat II Unlimited (V1.0) (Hack By Smoke).bin',                                     img:'Mortal Kombat II (World).webp',                                                              genre:'fighting', emoji:'M' },
  { title:'Mortal Kombat 3',           file:'mortal kombat 3 (usa).bin',                                                                 img:'Mortal Kombat 3 (USA).webp',                                                                 genre:'fighting', emoji:'M' },
  { title:"Street Fighter II CE",      file:"street fighter ii' - special champion edition (usa).bin",                                   img:"Street Fighter II' - Special Champion Edition (USA).webp",                                   genre:'fighting', emoji:'S' },
  { title:'Super Street Fighter II',   file:'super street fighter ii - the new challengers (usa).bin',                                   img:'Super Street Fighter II (USA).webp',                                                         genre:'fighting', emoji:'S' },
  { title:'Fatal Fury 2',              file:'fatal fury 2 (usa, kor).bin',                                                               img:'Fatal Fury 2 (USA, Korea).webp',                                                             genre:'fighting', emoji:'F' },
  { title:'Samurai Shodown',           file:'samurai shodown (usa).bin',                                                                 img:'Samurai Shodown (USA).webp',                                                                 genre:'fighting', emoji:'S' },
  { title:'World Heroes',              file:'world heroes (usa).bin',                                                                    img:'World Heroes (USA).webp',                                                                    genre:'fighting', emoji:'W' },
  { title:'Virtua Fighter 2',          file:'virtua fighter 2 (prototype - sep 27, 1996).bin',                                           img:'Virtua Fighter 2 (USA, Europe).webp',                                                        genre:'fighting', emoji:'V' },
  // Shooters
  { title:'Thunder Force III',         file:'thunder force iii (usa, jpn).bin',                                                          img:'Thunder Force III (Japan, USA).webp',                                                         genre:'shooter', emoji:'T' },
  { title:'Thunder Force IV',          file:'thunder force iv (jpn).bin',                                                                img:'Thunder Force IV (Japan).webp',                                                              genre:'shooter', emoji:'T' },
  { title:'Lightening Force',          file:'lightening force - quest for the darkstar (usa).bin',                                       img:'Lightening Force - Quest for the Darkstar (USA).webp',                                       genre:'shooter', emoji:'L' },
  { title:'Steel Empire',              file:'steel empire (usa).bin',                                                                    img:'Steel Empire (USA).webp',                                                                    genre:'shooter', emoji:'S' },
  { title:'MUSHA Aleste',              file:'musha - metallic uniframe super hybrid armor (usa).bin',                                    img:'MUSHA - Metallic Uniframe Super Hybrid Armor (USA).webp',                                    genre:'shooter', emoji:'M' },
  { title:'Truxton',                   file:'truxton -- tatsujin (world).bin',                                                           img:'Tatsujin ~ Truxton (World).webp',                                                            genre:'shooter', emoji:'T' },
  { title:'Gaiares',                   file:'gaiares (usa, jpn).bin',                                                                    img:'Gaiares (Japan, USA).webp',                                                                  genre:'shooter', emoji:'G' },
  // RPG
  { title:'Shining Force',             file:'shining force (usa).bin',                                                                   img:'Shining Force (USA).webp',                                                                   genre:'rpg', emoji:'S' },
  { title:'Shining Force II',          file:'shining force ii (usa).bin',                                                                img:'Shining Force II (USA).webp',                                                                genre:'rpg', emoji:'S' },
  { title:'Shining in the Darkness',   file:'shining in the darkness (euro, usa).bin',                                                   img:'Shining in the Darkness (USA, Europe).webp',                                                 genre:'rpg', emoji:'S' },
  { title:'Landstalker',               file:'landstalker (usa).bin',                                                                     img:'Landstalker (USA).webp',                                                                     genre:'rpg', emoji:'L' },
  { title:'Phantasy Star II',          file:'phantasy star ii (euro, usa).bin',                                                          img:'Phantasy Star II (USA, Europe).webp',                                                        genre:'rpg', emoji:'P' },
  { title:'Phantasy Star IV',          file:'phantasy star iv (usa).bin',                                                                img:'Phantasy Star IV (USA).webp',                                                                genre:'rpg', emoji:'P' },
  { title:'Crusader of Centy',         file:'crusader of centy (usa).bin',                                                               img:'Crusader of Centy (USA).webp',                                                               genre:'rpg', emoji:'C' },
  { title:'Light Crusader',            file:'light crusader (usa).bin',                                                                  img:'Light Crusader (USA).webp',                                                                  genre:'rpg', emoji:'L' },
  { title:'Beyond Oasis',              file:'beyond oasis (usa).bin',                                                                    img:'Beyond Oasis (USA).webp',                                                                    genre:'rpg', emoji:'B' },
  // Sports
  { title:'NBA Jam',                   file:'nba jam (euro, usa) (v1.1).bin',                                                            img:'NBA Jam (USA, Europe) (v1.1).webp',                                                          genre:'sports', emoji:'N' },
  { title:'NBA Jam TE',                file:'nba jam tournament edition (world).bin',                                                    img:'NBA Jam - Tournament Edition (World).webp',                                                  genre:'sports', emoji:'N' },
  { title:'NBA Live 95',               file:'nba live 95 (euro, usa).bin',                                                               img:'NBA Live 95 (USA, Europe).webp',                                                             genre:'sports', emoji:'N' },
  { title:'Barkley: Shut Up and Jam!', file:'barkley shut up and jam! (euro, usa).bin',                                                  img:'Barkley Shut Up and Jam! (USA, Europe).webp',                                               genre:'sports', emoji:'B' },
  { title:'Madden NFL 95',             file:'madden nfl 95 (euro, usa).bin',                                                             img:'Madden NFL 95 (USA, Europe).webp',                                                           genre:'sports', emoji:'M' },
  { title:'Madden NFL 96',             file:'madden nfl 96 (euro, usa).bin',                                                             img:'Madden NFL 96 (USA, Europe).webp',                                                           genre:'sports', emoji:'M' },
  { title:'PGA Tour Golf II',          file:'pga tour golf ii (euro, usa) (v1.1).bin',                                                   img:'PGA Tour Golf II (USA, Europe) (v1.1).webp',                                                 genre:'sports', emoji:'P' },
  // Racing
  { title:'Road Rash',                 file:'road rash (euro, usa).bin',                                                                 img:'Road Rash (USA, Europe).webp',                                                               genre:'racing', emoji:'R' },
  { title:'Road Rash II',              file:'road rash ii (euro, usa) (v1.2).bin',                                                       img:'Road Rash II (USA, Europe) (v1.2).webp',                                                     genre:'racing', emoji:'R' },
  { title:'Road Rash 3',               file:'road rash 3 (usa) (alpha).bin',                                                             img:'Road Rash 3 (USA) (Alpha).webp',                                                             genre:'racing', emoji:'R' },
  { title:'Micro Machines 2',          file:'micro machines 2 - turbo tournament (euro) (j-cart) (alt).bin',                             img:'Micro Machines 2 - Turbo Tournament (Europe) (J-Cart).webp',                                genre:'racing', emoji:'M' },

  // --- Nintendo packs added automatically ---
  {"title":"Dragon Warrior Monsters 2 - Tara's Adventure","file":"gbc/Dragon Warrior Monsters 2 - Tara's Adventure (USA) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"D","console":"gbc","core":"gb"},
  {"title":"Dragon Warrior Monsters 2 - Cobi's Journey","file":"gbc/Dragon Warrior Monsters 2 - Cobi's Journey (USA) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"D","console":"gbc","core":"gb"},
  {"title":"Dragon Warrior Monsters","file":"gbc/Dragon Warrior Monsters (USA, Europe) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"D","console":"gbc","core":"gb"},
  {"title":"Dragon Warrior III","file":"gbc/Dragon Warrior III (USA).zip","img":"","genre":"retro","emoji":"D","console":"gbc","core":"gb"},
  {"title":"Dragon Warrior I & II","file":"gbc/Dragon Warrior I & II (USA) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"D","console":"gbc","core":"gb"},
  {"title":"Dragon Ball Z - Legendary Super Warriors","file":"gbc/Dragon Ball Z - Legendary Super Warriors (USA).zip","img":"","genre":"retro","emoji":"D","console":"gbc","core":"gb"},
  {"title":"Donkey Kong Country","file":"gbc/Donkey Kong Country (USA, Europe) (En,Fr,De,Es,It).zip","img":"","genre":"retro","emoji":"D","console":"gbc","core":"gb"},
  {"title":"Donald Duck - Quack Attack","file":"gbc/Donald Duck - Quack Attack (Europe) (En,Fr,De,Es,It).zip","img":"","genre":"retro","emoji":"D","console":"gbc","core":"gb"},
  {"title":"Dexter's Laboratory - Robot Rampage","file":"gbc/Dexter's Laboratory - Robot Rampage (USA, Europe).zip","img":"","genre":"retro","emoji":"D","console":"gbc","core":"gb"},
  {"title":"Crystalis","file":"gbc/Crystalis (USA).zip","img":"","genre":"retro","emoji":"C","console":"gbc","core":"gb"},
  {"title":"Croc 2","file":"gbc/Croc 2 (USA, Europe).zip","img":"","genre":"retro","emoji":"C","console":"gbc","core":"gb"},
  {"title":"Croc","file":"gbc/Croc (USA, Europe).zip","img":"","genre":"retro","emoji":"C","console":"gbc","core":"gb"},
  {"title":"Conker's Pocket Tales","file":"gbc/Conker's Pocket Tales (USA, Europe) (En,Fr,De) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"C","console":"gbc","core":"gb"},
  {"title":"Bust-A-Move Millennium","file":"gbc/Bust-A-Move Millennium (USA, Europe).zip","img":"","genre":"retro","emoji":"B","console":"gbc","core":"gb"},
  {"title":"Bugs Bunny in - Crazy Castle 4","file":"gbc/Bugs Bunny in - Crazy Castle 4 (USA).zip","img":"","genre":"retro","emoji":"B","console":"gbc","core":"gb"},
  {"title":"Bugs Bunny - Crazy Castle 3","file":"gbc/Bugs Bunny - Crazy Castle 3 (USA, Europe) (GB Compatible).zip","img":"","genre":"retro","emoji":"B","console":"gbc","core":"gb"},
  {"title":"Bomberman Quest","file":"gbc/Bomberman Quest (USA) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"B","console":"gbc","core":"gb"},
  {"title":"Bomberman Max - Red Challenger","file":"gbc/Bomberman Max - Red Challenger (USA).zip","img":"","genre":"retro","emoji":"B","console":"gbc","core":"gb"},
  {"title":"Bomberman Max - Blue Champion","file":"gbc/Bomberman Max - Blue Champion (USA).zip","img":"","genre":"retro","emoji":"B","console":"gbc","core":"gb"},
  {"title":"Blaster Master - Enemy Below","file":"gbc/Blaster Master - Enemy Below (USA, Europe) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"B","console":"gbc","core":"gb"},
  {"title":"Blade","file":"gbc/Blade (USA, Europe).zip","img":"","genre":"retro","emoji":"B","console":"gbc","core":"gb"},
  {"title":"Bionic Commando - Elite Forces","file":"gbc/Bionic Commando - Elite Forces (USA, Australia).zip","img":"","genre":"retro","emoji":"B","console":"gbc","core":"gb"},
  {"title":"Batman Beyond - Return of the Joker","file":"gbc/Batman Beyond - Return of the Joker (USA).zip","img":"","genre":"retro","emoji":"B","console":"gbc","core":"gb"},
  {"title":"Batman - Chaos in Gotham","file":"gbc/Batman - Chaos in Gotham (USA).zip","img":"","genre":"retro","emoji":"B","console":"gbc","core":"gb"},
  {"title":"Azure Dreams","file":"gbc/Azure Dreams (USA) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"A","console":"gbc","core":"gb"},
  {"title":"Asterix & Obelix","file":"gbc/Asterix & Obelix (Europe) (En,Fr,De,Es).zip","img":"","genre":"retro","emoji":"A","console":"gbc","core":"gb"},
  {"title":"Animorphs","file":"gbc/Animorphs (USA).zip","img":"","genre":"retro","emoji":"A","console":"gbc","core":"gb"},
  {"title":"Alone in the Dark - The New Nightmare","file":"gbc/Alone in the Dark - The New Nightmare (USA) (En,Fr,Es).zip","img":"","genre":"retro","emoji":"A","console":"gbc","core":"gb"},
  {"title":"Aliens - Thanatos Encounter","file":"gbc/Aliens - Thanatos Encounter (USA, Europe).zip","img":"","genre":"retro","emoji":"A","console":"gbc","core":"gb"},
  {"title":"Yu-Gi-Oh! - Dark Duel Stories","file":"gbc/Yu-Gi-Oh! - Dark Duel Stories (USA).zip","img":"","genre":"retro","emoji":"Y","console":"gbc","core":"gb"},
  {"title":"Wendy - Every Witch Way","file":"gbc/Wendy - Every Witch Way (USA, Europe).zip","img":"","genre":"retro","emoji":"W","console":"gbc","core":"gb"},
  {"title":"Warlocked","file":"gbc/Warlocked (USA).zip","img":"","genre":"retro","emoji":"W","console":"gbc","core":"gb"},
  {"title":"Wario Land II","file":"gbc/Wario Land II (USA, Europe) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"W","console":"gbc","core":"gb"},
  {"title":"Wario Land 3","file":"gbc/Wario Land 3 (World) (En,Ja).zip","img":"","genre":"retro","emoji":"W","console":"gbc","core":"gb"},
  {"title":"Wacky Races","file":"gbc/Wacky Races (USA) (En,Fr,Es).zip","img":"","genre":"retro","emoji":"W","console":"gbc","core":"gb"},
  {"title":"Turok 3 - Shadow of Oblivion","file":"gbc/Turok 3 - Shadow of Oblivion (USA, Europe) (En,Fr,De,Es).zip","img":"","genre":"retro","emoji":"T","console":"gbc","core":"gb"},
  {"title":"Turok 2 - Seeds of Evil","file":"gbc/Turok 2 - Seeds of Evil (USA, Europe) (En,Fr,De,Es) (GB Compatible).zip","img":"","genre":"retro","emoji":"T","console":"gbc","core":"gb"},
  {"title":"Turok - Rage Wars","file":"gbc/Turok - Rage Wars (USA, Europe) (En,Fr,De,Es).zip","img":"","genre":"retro","emoji":"T","console":"gbc","core":"gb"},
  {"title":"Tomb Raider","file":"gbc/Tomb Raider (USA, Europe) (En,Fr,De,Es,It).zip","img":"","genre":"retro","emoji":"T","console":"gbc","core":"gb"},
  {"title":"Tomb Raider - Curse of the Sword","file":"gbc/Tomb Raider - Curse of the Sword (USA, Europe).zip","img":"","genre":"retro","emoji":"T","console":"gbc","core":"gb"},
  {"title":"Toki Tori","file":"gbc/Toki Tori (USA, Europe) (En,Ja,Fr,De,Es).zip","img":"","genre":"retro","emoji":"T","console":"gbc","core":"gb"},
  {"title":"Tetris DX","file":"gbc/Tetris DX (World) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"T","console":"gbc","core":"gb"},
  {"title":"Survival Kids 2 - Dasshutsu!! Futago-Jima!","file":"gbc/Survival Kids 2 - Dasshutsu!! Futago-Jima! (Japan) (SGB Enhanced) (GB Compatible) [T-En by Hattontown & NikcDC v0.9].zip","img":"","genre":"retro","emoji":"S","console":"gbc","core":"gb"},
  {"title":"Survival Kids","file":"gbc/Survival Kids (USA) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"S","console":"gbc","core":"gb"},
  {"title":"Super Robot Pinball","file":"gbc/Super Robot Pinball (Japan) [T-En by Kurenaikurai & Luis16bits & Marc_max v1.0].zip","img":"","genre":"retro","emoji":"S","console":"gbc","core":"gb"},
  {"title":"Super Mario Bros. Deluxe","file":"gbc/Super Mario Bros. Deluxe (USA, Europe) (Rev 2).zip","img":"","genre":"retro","emoji":"S","console":"gbc","core":"gb"},
  {"title":"Shin Megami Tensei Devil Children - Kuro no Sho","file":"gbc/Shin Megami Tensei Devil Children - Kuro no Sho (Japan) (SGB Enhanced) (GB Compatible) [T-En by Higsby & SpecialAgentApe v1.2].zip","img":"","genre":"retro","emoji":"S","console":"gbc","core":"gb"},
  {"title":"Shantae","file":"gbc/Shantae (USA).zip","img":"","genre":"retro","emoji":"S","console":"gbc","core":"gb"},
  {"title":"R-Type DX","file":"gbc/R-Type DX (USA, Europe) (GB Compatible).zip","img":"","genre":"retro","emoji":"R","console":"gbc","core":"gb"},
  {"title":"Revelations - The Demon Slayer","file":"gbc/Revelations - The Demon Slayer (USA) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"R","console":"gbc","core":"gb"},
  {"title":"Return of the Ninja","file":"gbc/Return of the Ninja (USA).zip","img":"","genre":"retro","emoji":"R","console":"gbc","core":"gb"},
  {"title":"Resident Evil Gaiden","file":"gbc/Resident Evil Gaiden (USA).zip","img":"","genre":"retro","emoji":"R","console":"gbc","core":"gb"},
  {"title":"Rayman 2","file":"gbc/Rayman 2 (USA) (En,Fr,De,Es,It).zip","img":"","genre":"retro","emoji":"R","console":"gbc","core":"gb"},
  {"title":"Rayman","file":"gbc/Rayman (USA) (En,Fr,De,Es,It,Nl).zip","img":"","genre":"retro","emoji":"R","console":"gbc","core":"gb"},
  {"title":"Project S-11","file":"gbc/Project S-11 (USA).zip","img":"","genre":"retro","emoji":"P","console":"gbc","core":"gb"},
  {"title":"Pokemon Trading Card Game 2 - The Invasion of Team GR!","file":"gbc/Pokemon Trading Card Game 2 - The Invasion of Team GR! (Japan) [T-En by Artemis251 & Jazz v1.0] [n].zip","img":"","genre":"retro","emoji":"P","console":"gbc","core":"gb"},
  {"title":"Pokemon Trading Card Game","file":"gbc/Pokemon Trading Card Game (USA, Australia) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"P","console":"gbc","core":"gb"},
  {"title":"Pokemon Puzzle Challenge","file":"gbc/Pokemon Puzzle Challenge (USA, Australia).zip","img":"","genre":"retro","emoji":"P","console":"gbc","core":"gb"},
  {"title":"Pokemon Pinball","file":"gbc/Pokemon Pinball (USA, Australia) (Rumble Version) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"P","console":"gbc","core":"gb"},
  {"title":"Pokemon - Silver Version","file":"gbc/Pokemon - Silver Version (USA, Europe) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"P","console":"gbc","core":"gb"},
  {"title":"Pokemon - Gold Version","file":"gbc/Pokemon - Gold Version (USA, Europe) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"P","console":"gbc","core":"gb"},
  {"title":"Pokemon - Crystal Version","file":"gbc/Pokemon - Crystal Version (USA, Europe) (Rev 1).zip","img":"","genre":"retro","emoji":"P","console":"gbc","core":"gb"},
  {"title":"Pocket Bomberman","file":"gbc/Pocket Bomberman (USA, Europe) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"P","console":"gbc","core":"gb"},
  {"title":"Mr. Driller","file":"gbc/Mr. Driller (USA).zip","img":"","genre":"retro","emoji":"M","console":"gbc","core":"gb"},
  {"title":"Motocross Maniacs 2","file":"gbc/Motocross Maniacs 2 (USA).zip","img":"","genre":"retro","emoji":"M","console":"gbc","core":"gb"},
  {"title":"Monster Rancher Explorer","file":"gbc/Monster Rancher Explorer (USA).zip","img":"","genre":"retro","emoji":"M","console":"gbc","core":"gb"},
  {"title":"Monkey Puncher","file":"gbc/Monkey Puncher (Europe) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"M","console":"gbc","core":"gb"},
  {"title":"Mobile Golf","file":"gbc/Mobile Golf (Japan) [T-En by ProstatePunch & Darkshade & REON Dev Team & Marc_Max v1.1] [Vanilla Unlock].zip","img":"","genre":"retro","emoji":"M","console":"gbc","core":"gb"},
  {"title":"Mission - Impossible","file":"gbc/Mission - Impossible (USA) (En,Fr,Es).zip","img":"","genre":"retro","emoji":"M","console":"gbc","core":"gb"},
  {"title":"Mickey's Speedway USA","file":"gbc/Mickey's Speedway USA (USA, Europe) (En,Fr,De,Es).zip","img":"","genre":"retro","emoji":"M","console":"gbc","core":"gb"},
  {"title":"Mickey's Racing Adventure","file":"gbc/Mickey's Racing Adventure (USA, Europe) (En,Fr,De,Es,It).zip","img":"","genre":"retro","emoji":"M","console":"gbc","core":"gb"},
  {"title":"Metal Walker","file":"gbc/Metal Walker (USA) (GB Compatible).zip","img":"","genre":"retro","emoji":"M","console":"gbc","core":"gb"},
  {"title":"Metal Gear Solid","file":"gbc/Metal Gear Solid (USA).zip","img":"","genre":"retro","emoji":"M","console":"gbc","core":"gb"},
  {"title":"Mega Man Xtreme 2","file":"gbc/Mega Man Xtreme 2 (USA, Europe).zip","img":"","genre":"retro","emoji":"M","console":"gbc","core":"gb"},
  {"title":"Mega Man Xtreme","file":"gbc/Mega Man Xtreme (USA, Europe) (GB Compatible).zip","img":"","genre":"retro","emoji":"M","console":"gbc","core":"gb"},
  {"title":"Mario Tennis","file":"gbc/Mario Tennis (USA).zip","img":"","genre":"retro","emoji":"M","console":"gbc","core":"gb"},
  {"title":"Mario Golf","file":"gbc/Mario Golf (USA).zip","img":"","genre":"retro","emoji":"M","console":"gbc","core":"gb"},
  {"title":"Magi Nation","file":"gbc/Magi Nation (USA).zip","img":"","genre":"retro","emoji":"M","console":"gbc","core":"gb"},
  {"title":"Lufia - The Legend Returns","file":"gbc/Lufia - The Legend Returns (USA).zip","img":"","genre":"retro","emoji":"L","console":"gbc","core":"gb"},
  {"title":"Legend of Zelda, The - Oracle of Seasons","file":"gbc/Legend of Zelda, The - Oracle of Seasons (USA, Australia).zip","img":"","genre":"retro","emoji":"L","console":"gbc","core":"gb"},
  {"title":"Legend of Zelda, The - Oracle of Ages","file":"gbc/Legend of Zelda, The - Oracle of Ages (USA, Australia).zip","img":"","genre":"retro","emoji":"L","console":"gbc","core":"gb"},
  {"title":"Legend of Zelda, The - Link's Awakening DX","file":"gbc/Legend of Zelda, The - Link's Awakening DX (USA, Europe) (Rev 2) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"L","console":"gbc","core":"gb"},
  {"title":"Legend of the River King GBC","file":"gbc/Legend of the River King GBC (USA) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"L","console":"gbc","core":"gb"},
  {"title":"Legend of the River King 2","file":"gbc/Legend of the River King 2 (USA) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"L","console":"gbc","core":"gb"},
  {"title":"Kirby - Tilt 'n' Tumble","file":"gbc/Kirby - Tilt 'n' Tumble (USA).zip","img":"","genre":"retro","emoji":"K","console":"gbc","core":"gb"},
  {"title":"Jungle Book, The - Mowgli's Wild Adventure","file":"gbc/Jungle Book, The - Mowgli's Wild Adventure (USA) (En,Fr,De,Es,It).zip","img":"","genre":"retro","emoji":"J","console":"gbc","core":"gb"},
  {"title":"John Romero's Daikatana","file":"gbc/John Romero's Daikatana (Europe) (En,Fr,It).zip","img":"","genre":"retro","emoji":"J","console":"gbc","core":"gb"},
  {"title":"Harvest Moon GBC","file":"gbc/Harvest Moon GBC (USA) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"H","console":"gbc","core":"gb"},
  {"title":"Harvest Moon 3 GBC","file":"gbc/Harvest Moon 3 GBC (USA).zip","img":"","genre":"retro","emoji":"H","console":"gbc","core":"gb"},
  {"title":"Harvest Moon 2 GBC","file":"gbc/Harvest Moon 2 GBC (USA) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"H","console":"gbc","core":"gb"},
  {"title":"Harry Potter and the Sorcerer's Stone","file":"gbc/Harry Potter and the Sorcerer's Stone (USA, Europe) (En,Fr,De,Es,It,Nl,Pt,Sv,No,Da,Fi).zip","img":"","genre":"retro","emoji":"H","console":"gbc","core":"gb"},
  {"title":"Harry Potter and the Chamber of Secrets","file":"gbc/Harry Potter and the Chamber of Secrets (USA, Europe) (En,Fr,De,Es,It,Nl,Pt,Sv,Da).zip","img":"","genre":"retro","emoji":"H","console":"gbc","core":"gb"},
  {"title":"Hands of Time","file":"gbc/Hands of Time (USA, Europe) (En,Fr,De,Es,It,Nl).zip","img":"","genre":"retro","emoji":"H","console":"gbc","core":"gb"},
  {"title":"Hamtaro - Ham-Hams Unite!","file":"gbc/Hamtaro - Ham-Hams Unite! (USA).zip","img":"","genre":"retro","emoji":"H","console":"gbc","core":"gb"},
  {"title":"Gremlins - Unleashed","file":"gbc/Gremlins - Unleashed (Europe) (En,Fr,De,Es,It,Pt).zip","img":"","genre":"retro","emoji":"G","console":"gbc","core":"gb"},
  {"title":"Grandia - Parallel Trippers","file":"gbc/Grandia - Parallel Trippers (Japan) [T-En by Adventurous Translations v1.03].zip","img":"","genre":"retro","emoji":"G","console":"gbc","core":"gb"},
  {"title":"Gen the Carpenter","file":"gbc/Gen the Carpenter (Japan) (SGB Enhanced) (GB Compatible) [T-En by PentarouZero v1.0] [n].zip","img":"","genre":"retro","emoji":"G","console":"gbc","core":"gb"},
  {"title":"Game & Watch Gallery 3","file":"gbc/Game & Watch Gallery 3 (USA, Europe) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"G","console":"gbc","core":"gb"},
  {"title":"Game & Watch Gallery 2","file":"gbc/Game & Watch Gallery 2 (USA, Europe) (SGB Enhanced) (GB Compatible).zip","img":"","genre":"retro","emoji":"G","console":"gbc","core":"gb"},
  {"title":"Driver - You Are the Wheelman","file":"gbc/Driver - You Are the Wheelman (USA) (En,Fr,De,Es,It).zip","img":"","genre":"retro","emoji":"D","console":"gbc","core":"gb"},
  {"title":"Cave Noire","file":"gb/Cave Noire (Japan) [T-En by Aeon Genesis v1.00].zip","img":"","genre":"retro","emoji":"C","console":"gb","core":"gb"},
  {"title":"Catrap","file":"gb/Catrap (USA).zip","img":"","genre":"retro","emoji":"C","console":"gb","core":"gb"},
  {"title":"Castlevania Legends","file":"gb/Castlevania Legends (USA, Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"C","console":"gb","core":"gb"},
  {"title":"Castlevania II - Belmont's Revenge","file":"gb/Castlevania II - Belmont's Revenge (USA, Europe).zip","img":"","genre":"retro","emoji":"C","console":"gb","core":"gb"},
  {"title":"Castlevania - The Adventure","file":"gb/Castlevania - The Adventure (USA).zip","img":"","genre":"retro","emoji":"C","console":"gb","core":"gb"},
  {"title":"Bugs Bunny Crazy Castle, The","file":"gb/Bugs Bunny Crazy Castle, The (USA, Europe).zip","img":"","genre":"retro","emoji":"B","console":"gb","core":"gb"},
  {"title":"Bugs Bunny Crazy Castle 2, The","file":"gb/Bugs Bunny Crazy Castle 2, The (USA).zip","img":"","genre":"retro","emoji":"B","console":"gb","core":"gb"},
  {"title":"Bubble Ghost","file":"gb/Bubble Ghost (USA, Europe).zip","img":"","genre":"retro","emoji":"B","console":"gb","core":"gb"},
  {"title":"Boxxle II","file":"gb/Boxxle II (USA, Europe).zip","img":"","genre":"retro","emoji":"B","console":"gb","core":"gb"},
  {"title":"Boxxle","file":"gb/Boxxle (USA, Europe) (Rev 1).zip","img":"","genre":"retro","emoji":"B","console":"gb","core":"gb"},
  {"title":"Booby Boys","file":"gb/Booby Boys (Japan) [T-En by HTI v1.00].zip","img":"","genre":"retro","emoji":"B","console":"gb","core":"gb"},
  {"title":"Blaster Master Boy","file":"gb/Blaster Master Boy (USA).zip","img":"","genre":"retro","emoji":"B","console":"gb","core":"gb"},
  {"title":"Bionic Commando","file":"gb/Bionic Commando (USA).zip","img":"","genre":"retro","emoji":"B","console":"gb","core":"gb"},
  {"title":"Battle Unit Zeoth","file":"gb/Battle Unit Zeoth (USA, Europe).zip","img":"","genre":"retro","emoji":"B","console":"gb","core":"gb"},
  {"title":"Battle Arena Toshinden","file":"gb/Battle Arena Toshinden (USA) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"B","console":"gb","core":"gb"},
  {"title":"Batman - The Video Game","file":"gb/Batman - The Video Game (World).zip","img":"","genre":"retro","emoji":"B","console":"gb","core":"gb"},
  {"title":"Batman - Return of the Joker","file":"gb/Batman - Return of the Joker (USA, Europe).zip","img":"","genre":"retro","emoji":"B","console":"gb","core":"gb"},
  {"title":"Balloon Kid","file":"gb/Balloon Kid (USA, Europe).zip","img":"","genre":"retro","emoji":"B","console":"gb","core":"gb"},
  {"title":"Avenging Spirit","file":"gb/Avenging Spirit (USA, Europe).zip","img":"","genre":"retro","emoji":"A","console":"gb","core":"gb"},
  {"title":"Atomic Punk","file":"gb/Atomic Punk (USA).zip","img":"","genre":"retro","emoji":"A","console":"gb","core":"gb"},
  {"title":"Astro Rabby","file":"gb/Astro Rabby (Japan).zip","img":"","genre":"retro","emoji":"A","console":"gb","core":"gb"},
  {"title":"Amazing Penguin","file":"gb/Amazing Penguin (USA, Europe).zip","img":"","genre":"retro","emoji":"A","console":"gb","core":"gb"},
  {"title":"Aerostar","file":"gb/Aerostar (USA, Europe).zip","img":"","genre":"retro","emoji":"A","console":"gb","core":"gb"},
  {"title":"Adventures of Star Saver, The","file":"gb/Adventures of Star Saver, The (USA, Europe).zip","img":"","genre":"retro","emoji":"A","console":"gb","core":"gb"},
  {"title":"Yoshi's Cookie","file":"gb/Yoshi's Cookie (USA, Europe).zip","img":"","genre":"retro","emoji":"Y","console":"gb","core":"gb"},
  {"title":"Yoshi","file":"gb/Yoshi (USA).zip","img":"","genre":"retro","emoji":"Y","console":"gb","core":"gb"},
  {"title":"X","file":"gb/X (Japan) [T-En by Anthropogon v0.9].zip","img":"","genre":"retro","emoji":"X","console":"gb","core":"gb"},
  {"title":"World Heroes 2 Jet","file":"gb/World Heroes 2 Jet (USA, Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"W","console":"gb","core":"gb"},
  {"title":"Wave Race","file":"gb/Wave Race (USA, Europe).zip","img":"","genre":"retro","emoji":"W","console":"gb","core":"gb"},
  {"title":"Wario Land II","file":"gb/Wario Land II (USA, Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"W","console":"gb","core":"gb"},
  {"title":"Wario Land - Super Mario Land 3","file":"gb/Wario Land - Super Mario Land 3 (World).zip","img":"","genre":"retro","emoji":"W","console":"gb","core":"gb"},
  {"title":"Wario Blast Featuring Bomberman!","file":"gb/Wario Blast Featuring Bomberman! (USA, Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"W","console":"gb","core":"gb"},
  {"title":"Vattle Giuce","file":"gb/Vattle Giuce (Japan).zip","img":"","genre":"retro","emoji":"V","console":"gb","core":"gb"},
  {"title":"Trip World","file":"gb/Trip World (Europe).zip","img":"","genre":"retro","emoji":"T","console":"gb","core":"gb"},
  {"title":"Trax","file":"gb/Trax (USA, Europe).zip","img":"","genre":"retro","emoji":"T","console":"gb","core":"gb"},
  {"title":"Tiny Toon Adventures 2 - Montana's Movie Madness","file":"gb/Tiny Toon Adventures 2 - Montana's Movie Madness (USA, Europe).zip","img":"","genre":"retro","emoji":"T","console":"gb","core":"gb"},
  {"title":"Tiny Toon Adventures - Babs' Big Break","file":"gb/Tiny Toon Adventures - Babs' Big Break (USA, Europe).zip","img":"","genre":"retro","emoji":"T","console":"gb","core":"gb"},
  {"title":"Tetris Blast","file":"gb/Tetris Blast (USA, Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"T","console":"gb","core":"gb"},
  {"title":"Tetris Attack","file":"gb/Tetris Attack (USA, Europe) (Rev 1) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"T","console":"gb","core":"gb"},
  {"title":"Tetris 2","file":"gb/Tetris 2 (USA, Europe) (Rev 1) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"T","console":"gb","core":"gb"},
  {"title":"Tetris","file":"gb/Tetris (World) (Rev 1).zip","img":"","genre":"retro","emoji":"T","console":"gb","core":"gb"},
  {"title":"Tennis","file":"gb/Tennis (World).zip","img":"","genre":"retro","emoji":"T","console":"gb","core":"gb"},
  {"title":"Teenage Mutant Ninja Turtles III - Radical Rescue","file":"gb/Teenage Mutant Ninja Turtles III - Radical Rescue (USA).zip","img":"","genre":"retro","emoji":"T","console":"gb","core":"gb"},
  {"title":"Teenage Mutant Ninja Turtles II - Back from the Sewers","file":"gb/Teenage Mutant Ninja Turtles II - Back from the Sewers (USA).zip","img":"","genre":"retro","emoji":"T","console":"gb","core":"gb"},
  {"title":"Teenage Mutant Ninja Turtles - Fall of the Foot Clan","file":"gb/Teenage Mutant Ninja Turtles - Fall of the Foot Clan (USA).zip","img":"","genre":"retro","emoji":"T","console":"gb","core":"gb"},
  {"title":"Tail 'Gator","file":"gb/Tail 'Gator (USA, Europe).zip","img":"","genre":"retro","emoji":"T","console":"gb","core":"gb"},
  {"title":"Sword of Hope, The","file":"gb/Sword of Hope, The (USA).zip","img":"","genre":"retro","emoji":"S","console":"gb","core":"gb"},
  {"title":"Sword of Hope II, The","file":"gb/Sword of Hope II, The (USA).zip","img":"","genre":"retro","emoji":"S","console":"gb","core":"gb"},
  {"title":"Super R.C. Pro-Am","file":"gb/Super R.C. Pro-Am (USA, Europe).zip","img":"","genre":"retro","emoji":"S","console":"gb","core":"gb"},
  {"title":"Super Mario Land 2 - 6 Golden Coins","file":"gb/Super Mario Land 2 - 6 Golden Coins (USA, Europe) (Rev 2).zip","img":"","genre":"retro","emoji":"S","console":"gb","core":"gb"},
  {"title":"Super Mario Land","file":"gb/Super Mario Land (World) (Rev 1).zip","img":"","genre":"retro","emoji":"S","console":"gb","core":"gb"},
  {"title":"Spud's Adventure","file":"gb/Spud's Adventure (USA).zip","img":"","genre":"retro","emoji":"S","console":"gb","core":"gb"},
  {"title":"Spanky's Quest","file":"gb/Spanky's Quest (USA).zip","img":"","genre":"retro","emoji":"S","console":"gb","core":"gb"},
  {"title":"Solomon's Club","file":"gb/Solomon's Club (USA).zip","img":"","genre":"retro","emoji":"S","console":"gb","core":"gb"},
  {"title":"SolarStriker","file":"gb/SolarStriker (World).zip","img":"","genre":"retro","emoji":"S","console":"gb","core":"gb"},
  {"title":"Skate or Die - Bad 'N Rad","file":"gb/Skate or Die - Bad 'N Rad (USA).zip","img":"","genre":"retro","emoji":"S","console":"gb","core":"gb"},
  {"title":"R-Type II","file":"gb/R-Type II (Europe).zip","img":"","genre":"retro","emoji":"R","console":"gb","core":"gb"},
  {"title":"R-Type","file":"gb/R-Type (USA, Europe).zip","img":"","genre":"retro","emoji":"R","console":"gb","core":"gb"},
  {"title":"Rolan's Curse II","file":"gb/Rolan's Curse II (USA).zip","img":"","genre":"retro","emoji":"R","console":"gb","core":"gb"},
  {"title":"Rolan's Curse","file":"gb/Rolan's Curse (USA).zip","img":"","genre":"retro","emoji":"R","console":"gb","core":"gb"},
  {"title":"Quarth","file":"gb/Quarth (USA, Europe).zip","img":"","genre":"retro","emoji":"Q","console":"gb","core":"gb"},
  {"title":"Q Billion","file":"gb/Q Billion (USA).zip","img":"","genre":"retro","emoji":"Q","console":"gb","core":"gb"},
  {"title":"Pop'n TwinBee","file":"gb/Pop'n TwinBee (Europe).zip","img":"","genre":"retro","emoji":"P","console":"gb","core":"gb"},
  {"title":"Pokemon - Yellow Version - Special Pikachu Edition","file":"gb/Pokemon - Yellow Version - Special Pikachu Edition (USA, Europe) (CGB+SGB Enhanced).zip","img":"","genre":"retro","emoji":"P","console":"gb","core":"gb"},
  {"title":"Pokemon - Red Version","file":"gb/Pokemon - Red Version (USA, Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"P","console":"gb","core":"gb"},
  {"title":"Pokemon - Blue Version","file":"gb/Pokemon - Blue Version (USA, Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"P","console":"gb","core":"gb"},
  {"title":"Pocket Bomberman","file":"gb/Pocket Bomberman (Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"P","console":"gb","core":"gb"},
  {"title":"Pinball - Revenge of the 'Gator","file":"gb/Pinball - Revenge of the 'Gator (USA, Europe).zip","img":"","genre":"retro","emoji":"P","console":"gb","core":"gb"},
  {"title":"Picross 2","file":"gb/Picross 2 (Japan) (SGB Enhanced) [T-En by Zed v1.0].zip","img":"","genre":"retro","emoji":"P","console":"gb","core":"gb"},
  {"title":"Penguin Wars","file":"gb/Penguin Wars (USA).zip","img":"","genre":"retro","emoji":"P","console":"gb","core":"gb"},
  {"title":"Parodius","file":"gb/Parodius (Europe).zip","img":"","genre":"retro","emoji":"P","console":"gb","core":"gb"},
  {"title":"Painter Momopie","file":"gb/Painter Momopie (Japan) [T-En by Stardust Crusaders v1.00].zip","img":"","genre":"retro","emoji":"P","console":"gb","core":"gb"},
  {"title":"Out of Gas","file":"gb/Out of Gas (USA).zip","img":"","genre":"retro","emoji":"O","console":"gb","core":"gb"},
  {"title":"Operation C","file":"gb/Operation C (USA).zip","img":"","genre":"retro","emoji":"O","console":"gb","core":"gb"},
  {"title":"Noobow","file":"gb/Noobow (Japan) [T-En by Stardust Crusaders v1.00].zip","img":"","genre":"retro","emoji":"N","console":"gb","core":"gb"},
  {"title":"Ninja Taro","file":"gb/Ninja Taro (USA).zip","img":"","genre":"retro","emoji":"N","console":"gb","core":"gb"},
  {"title":"Ninja Gaiden Shadow","file":"gb/Ninja Gaiden Shadow (USA).zip","img":"","genre":"retro","emoji":"N","console":"gb","core":"gb"},
  {"title":"Ninja Boy 2","file":"gb/Ninja Boy 2 (USA, Europe).zip","img":"","genre":"retro","emoji":"N","console":"gb","core":"gb"},
  {"title":"Ninja Boy","file":"gb/Ninja Boy (USA, Europe).zip","img":"","genre":"retro","emoji":"N","console":"gb","core":"gb"},
  {"title":"Nemesis II - The Return of the Hero","file":"gb/Nemesis II - The Return of the Hero (Europe).zip","img":"","genre":"retro","emoji":"N","console":"gb","core":"gb"},
  {"title":"Nemesis","file":"gb/Nemesis (USA).zip","img":"","genre":"retro","emoji":"N","console":"gb","core":"gb"},
  {"title":"Mystical Ninja Starring Goemon","file":"gb/Mystical Ninja Starring Goemon (USA) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Motocross Maniacs","file":"gb/Motocross Maniacs (USA).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Montezuma's Return!","file":"gb/Montezuma's Return! (Europe) (En,Fr,De,Es,It).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Monster Max","file":"gb/Monster Max (Europe) (En,Fr,De,Es,It,Nl).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Mole Mania","file":"gb/Mole Mania (USA, Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Mickey's Dangerous Chase","file":"gb/Mickey's Dangerous Chase (USA).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Mickey Mouse - Magic Wands!","file":"gb/Mickey Mouse - Magic Wands! (USA, Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Metroid II - Return of Samus","file":"gb/Metroid II - Return of Samus (World).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Metal Masters","file":"gb/Metal Masters (USA).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Mercenary Force","file":"gb/Mercenary Force (USA, Europe).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Mega Man V","file":"gb/Mega Man V (USA) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Mega Man IV","file":"gb/Mega Man IV (USA).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Mega Man III","file":"gb/Mega Man III (USA).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Mega Man II","file":"gb/Mega Man II (USA).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Mega Man - Dr. Wily's Revenge","file":"gb/Mega Man - Dr. Wily's Revenge (USA).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Maru's Mission","file":"gb/Maru's Mission (USA).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Mario's Picross","file":"gb/Mario's Picross (USA, Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Magic Knight Rayearth","file":"gb/Magic Knight Rayearth (Japan) (SGB Enhanced) [T-En by LIPEMCO! Translations v1.0].zip","img":"","genre":"retro","emoji":"M","console":"gb","core":"gb"},
  {"title":"Lock n' Chase ~ Lock 'n' Chase","file":"gb/Lock n' Chase ~ Lock 'n' Chase (World).zip","img":"","genre":"retro","emoji":"L","console":"gb","core":"gb"},
  {"title":"Legend of Zelda, The - Link's Awakening","file":"gb/Legend of Zelda, The - Link's Awakening (USA, Europe) (Rev 2).zip","img":"","genre":"retro","emoji":"L","console":"gb","core":"gb"},
  {"title":"Legend of the River King GB","file":"gb/Legend of the River King GB (USA) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"L","console":"gb","core":"gb"},
  {"title":"Kwirk - He's A-maze-ing!","file":"gb/Kwirk - He's A-maze-ing! (USA, Europe).zip","img":"","genre":"retro","emoji":"K","console":"gb","core":"gb"},
  {"title":"Kung-Fu Master","file":"gb/Kung-Fu Master (USA, Europe).zip","img":"","genre":"retro","emoji":"K","console":"gb","core":"gb"},
  {"title":"Kirby's Star Stacker","file":"gb/Kirby's Star Stacker (USA, Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"K","console":"gb","core":"gb"},
  {"title":"Kirby's Pinball Land","file":"gb/Kirby's Pinball Land (USA, Europe).zip","img":"","genre":"retro","emoji":"K","console":"gb","core":"gb"},
  {"title":"Kirby's Dream Land 2","file":"gb/Kirby's Dream Land 2 (USA, Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"K","console":"gb","core":"gb"},
  {"title":"Kirby's Dream Land","file":"gb/Kirby's Dream Land (USA, Europe).zip","img":"","genre":"retro","emoji":"K","console":"gb","core":"gb"},
  {"title":"Kirby's Block Ball","file":"gb/Kirby's Block Ball (USA, Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"K","console":"gb","core":"gb"},
  {"title":"Kingdom Crusade","file":"gb/Kingdom Crusade (USA).zip","img":"","genre":"retro","emoji":"K","console":"gb","core":"gb"},
  {"title":"Kid Icarus - Of Myths and Monsters","file":"gb/Kid Icarus - Of Myths and Monsters (USA, Europe).zip","img":"","genre":"retro","emoji":"K","console":"gb","core":"gb"},
  {"title":"Kid Dracula","file":"gb/Kid Dracula (USA, Europe).zip","img":"","genre":"retro","emoji":"K","console":"gb","core":"gb"},
  {"title":"James Bond 007","file":"gb/James Bond 007 (USA, Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"J","console":"gb","core":"gb"},
  {"title":"Heiankyo Alien","file":"gb/Heiankyo Alien (USA).zip","img":"","genre":"retro","emoji":"H","console":"gb","core":"gb"},
  {"title":"Harvest Moon GB","file":"gb/Harvest Moon GB (USA) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"H","console":"gb","core":"gb"},
  {"title":"Hammerin' Harry","file":"gb/Hammerin' Harry (Europe).zip","img":"","genre":"retro","emoji":"H","console":"gb","core":"gb"},
  {"title":"Gremlins 2 - The New Batch","file":"gb/Gremlins 2 - The New Batch (World).zip","img":"","genre":"retro","emoji":"G","console":"gb","core":"gb"},
  {"title":"Great Greed","file":"gb/Great Greed (USA).zip","img":"","genre":"retro","emoji":"G","console":"gb","core":"gb"},
  {"title":"Golf","file":"gb/Golf (World).zip","img":"","genre":"retro","emoji":"G","console":"gb","core":"gb"},
  {"title":"Ghostbusters II","file":"gb/Ghostbusters II (USA, Europe).zip","img":"","genre":"retro","emoji":"G","console":"gb","core":"gb"},
  {"title":"Gargoyle's Quest II - The Demon Darkness","file":"gb/Gargoyle's Quest II - The Demon Darkness (Japan) [T-En by Bailli v1.0] [n].zip","img":"","genre":"retro","emoji":"G","console":"gb","core":"gb"},
  {"title":"Gargoyle's Quest","file":"gb/Gargoyle's Quest (USA, Europe).zip","img":"","genre":"retro","emoji":"G","console":"gb","core":"gb"},
  {"title":"Game & Watch Gallery","file":"gb/Game & Watch Gallery (USA) (Rev 1) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"G","console":"gb","core":"gb"},
  {"title":"Fortified Zone","file":"gb/Fortified Zone (USA, Europe).zip","img":"","genre":"retro","emoji":"F","console":"gb","core":"gb"},
  {"title":"For the Frog the Bell Tolls","file":"gb/For the Frog the Bell Tolls (Japan) [T-En by Ryanbgstl v1.0] [n].zip","img":"","genre":"retro","emoji":"F","console":"gb","core":"gb"},
  {"title":"Final Fantasy Legend, The","file":"gb/Final Fantasy Legend, The (USA).zip","img":"","genre":"retro","emoji":"F","console":"gb","core":"gb"},
  {"title":"Final Fantasy Legend III","file":"gb/Final Fantasy Legend III (USA).zip","img":"","genre":"retro","emoji":"F","console":"gb","core":"gb"},
  {"title":"Final Fantasy Legend II","file":"gb/Final Fantasy Legend II (USA).zip","img":"","genre":"retro","emoji":"F","console":"gb","core":"gb"},
  {"title":"Final Fantasy Adventure","file":"gb/Final Fantasy Adventure (USA).zip","img":"","genre":"retro","emoji":"F","console":"gb","core":"gb"},
  {"title":"Fighting Simulator 2 in 1 - Flying Warriors","file":"gb/Fighting Simulator 2 in 1 - Flying Warriors (USA, Europe).zip","img":"","genre":"retro","emoji":"F","console":"gb","core":"gb"},
  {"title":"Fastest Lap","file":"gb/Fastest Lap (USA).zip","img":"","genre":"retro","emoji":"F","console":"gb","core":"gb"},
  {"title":"Faceball 2000","file":"gb/Faceball 2000 (USA).zip","img":"","genre":"retro","emoji":"F","console":"gb","core":"gb"},
  {"title":"F-1 Race","file":"gb/F-1 Race (World) (Rev 1).zip","img":"","genre":"retro","emoji":"F","console":"gb","core":"gb"},
  {"title":"DuckTales 2","file":"gb/DuckTales 2 (USA).zip","img":"","genre":"retro","emoji":"D","console":"gb","core":"gb"},
  {"title":"DuckTales","file":"gb/DuckTales (USA).zip","img":"","genre":"retro","emoji":"D","console":"gb","core":"gb"},
  {"title":"Dropzone","file":"gb/Dropzone (Europe).zip","img":"","genre":"retro","emoji":"D","console":"gb","core":"gb"},
  {"title":"DragonHeart","file":"gb/DragonHeart (USA, Europe).zip","img":"","genre":"retro","emoji":"D","console":"gb","core":"gb"},
  {"title":"Dr. Mario","file":"gb/Dr. Mario (World) (Rev 1).zip","img":"","genre":"retro","emoji":"D","console":"gb","core":"gb"},
  {"title":"Dr. Franken II","file":"gb/Dr. Franken II (USA, Europe) (En,Fr,De,Es,It,Nl,Sv).zip","img":"","genre":"retro","emoji":"D","console":"gb","core":"gb"},
  {"title":"Dr. Franken","file":"gb/Dr. Franken (USA).zip","img":"","genre":"retro","emoji":"D","console":"gb","core":"gb"},
  {"title":"Donkey Kong Land III","file":"gb/Donkey Kong Land III (USA, Europe) (Rev 1) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"D","console":"gb","core":"gb"},
  {"title":"Donkey Kong Land 2","file":"gb/Donkey Kong Land 2 (USA, Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"D","console":"gb","core":"gb"},
  {"title":"Donkey Kong Land","file":"gb/Donkey Kong Land (USA, Europe) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"D","console":"gb","core":"gb"},
  {"title":"Donkey Kong","file":"gb/Donkey Kong (Japan, USA) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"D","console":"gb","core":"gb"},
  {"title":"Dexterity","file":"gb/Dexterity (USA, Europe).zip","img":"","genre":"retro","emoji":"D","console":"gb","core":"gb"},
  {"title":"Dead Heat Scramble","file":"gb/Dead Heat Scramble (USA).zip","img":"","genre":"retro","emoji":"D","console":"gb","core":"gb"},
  {"title":"Darkwing Duck","file":"gb/Darkwing Duck (USA).zip","img":"","genre":"retro","emoji":"D","console":"gb","core":"gb"},
  {"title":"Cosmo Tank","file":"gb/Cosmo Tank (USA).zip","img":"","genre":"retro","emoji":"C","console":"gb","core":"gb"},
  {"title":"Contra - The Alien Wars","file":"gb/Contra - The Alien Wars (USA) (SGB Enhanced).zip","img":"","genre":"retro","emoji":"C","console":"gb","core":"gb"},
  {"title":"Chalvo 55 - Super Puzzle Action","file":"gb/Chalvo 55 - Super Puzzle Action (Japan) [T-En by Lame Boy v1.0].zip","img":"","genre":"retro","emoji":"C","console":"gb","core":"gb"},
  {"title":"Blaster Master","file":"nes/Blaster Master (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Blades of Steel","file":"nes/Blades of Steel (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Bionic Commando","file":"nes/Bionic Commando (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Bio Miracle Baby Upa!!","file":"nes/Bio Miracle Baby Upa!! (Japan) [T-En by Vice Translations v1.00] [n].zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Best of the Best - Championship Karate","file":"nes/Best of the Best - Championship Karate (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Battletoads-Double Dragon","file":"nes/Battletoads-Double Dragon (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Battletoads","file":"nes/Battletoads (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Battle of Olympus, The","file":"nes/Battle of Olympus, The (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Batman Returns","file":"nes/Batman Returns (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Batman - The Video Game","file":"nes/Batman - The Video Game (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Batman - Return of the Joker","file":"nes/Batman - Return of the Joker (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Banana Prince","file":"nes/Banana Prince (Germany) [T-En by KingMike's Translations v1.1a] [Add by Elbobelo v1.0].zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Balloon Fight","file":"nes/Balloon Fight (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Astyanax","file":"nes/Astyanax (USA).zip","img":"","genre":"retro","emoji":"A","console":"nes","core":"nes"},
  {"title":"Arkista's Ring","file":"nes/Arkista's Ring (USA).zip","img":"","genre":"retro","emoji":"A","console":"nes","core":"nes"},
  {"title":"Arkanoid","file":"nes/Arkanoid (USA).zip","img":"","genre":"retro","emoji":"A","console":"nes","core":"nes"},
  {"title":"Alfred Chicken","file":"nes/Alfred Chicken (USA).zip","img":"","genre":"retro","emoji":"A","console":"nes","core":"nes"},
  {"title":"Adventures of Tom Sawyer","file":"nes/Adventures of Tom Sawyer (USA).zip","img":"","genre":"retro","emoji":"A","console":"nes","core":"nes"},
  {"title":"Adventures of Lolo 3","file":"nes/Adventures of Lolo 3 (USA).zip","img":"","genre":"retro","emoji":"A","console":"nes","core":"nes"},
  {"title":"Adventures of Lolo 2","file":"nes/Adventures of Lolo 2 (USA).zip","img":"","genre":"retro","emoji":"A","console":"nes","core":"nes"},
  {"title":"Adventures of Lolo","file":"nes/Adventures of Lolo (USA).zip","img":"","genre":"retro","emoji":"A","console":"nes","core":"nes"},
  {"title":"Adventure Island II","file":"nes/Adventure Island II (USA).zip","img":"","genre":"retro","emoji":"A","console":"nes","core":"nes"},
  {"title":"Adventure Island 3","file":"nes/Adventure Island 3 (USA).zip","img":"","genre":"retro","emoji":"A","console":"nes","core":"nes"},
  {"title":"Adventure Island","file":"nes/Adventure Island (USA).zip","img":"","genre":"retro","emoji":"A","console":"nes","core":"nes"},
  {"title":"8 Eyes","file":"nes/8 Eyes (USA).zip","img":"","genre":"retro","emoji":"8","console":"nes","core":"nes"},
  {"title":"Zombie Nation","file":"nes/Zombie Nation (USA).zip","img":"","genre":"retro","emoji":"Z","console":"nes","core":"nes"},
  {"title":"Zoda's Revenge - StarTropics II","file":"nes/Zoda's Revenge - StarTropics II (USA).zip","img":"","genre":"retro","emoji":"Z","console":"nes","core":"nes"},
  {"title":"Zelda II - The Adventure of Link","file":"nes/Zelda II - The Adventure of Link (USA).zip","img":"","genre":"retro","emoji":"Z","console":"nes","core":"nes"},
  {"title":"Young Indiana Jones Chronicles, The","file":"nes/Young Indiana Jones Chronicles, The (USA).zip","img":"","genre":"retro","emoji":"Y","console":"nes","core":"nes"},
  {"title":"Yoshi's Cookie","file":"nes/Yoshi's Cookie (USA).zip","img":"","genre":"retro","emoji":"Y","console":"nes","core":"nes"},
  {"title":"Xexyz","file":"nes/Xexyz (USA).zip","img":"","genre":"retro","emoji":"X","console":"nes","core":"nes"},
  {"title":"Wrath of the Black Manta","file":"nes/Wrath of the Black Manta (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"W","console":"nes","core":"nes"},
  {"title":"Willow","file":"nes/Willow (USA).zip","img":"","genre":"retro","emoji":"W","console":"nes","core":"nes"},
  {"title":"Whomp 'Em","file":"nes/Whomp 'Em (USA).zip","img":"","genre":"retro","emoji":"W","console":"nes","core":"nes"},
  {"title":"Wario's Woods","file":"nes/Wario's Woods (USA).zip","img":"","genre":"retro","emoji":"W","console":"nes","core":"nes"},
  {"title":"Wai Wai World 2 - SOS!! Parsley Castle","file":"nes/Wai Wai World 2 - SOS!! Parsley Castle (Japan) [T-En by Vice Translations v1.01] [Add by Chronix v1.0] [n].zip","img":"","genre":"retro","emoji":"W","console":"nes","core":"nes"},
  {"title":"Wai Wai World","file":"nes/Wai Wai World (Japan) [T-En by Zynk Oxhyde v2.2] [n].zip","img":"","genre":"retro","emoji":"W","console":"nes","core":"nes"},
  {"title":"Wacky Races","file":"nes/Wacky Races (USA).zip","img":"","genre":"retro","emoji":"W","console":"nes","core":"nes"},
  {"title":"Vice - Project Doom","file":"nes/Vice - Project Doom (USA).zip","img":"","genre":"retro","emoji":"V","console":"nes","core":"nes"},
  {"title":"Ultima - Quest of the Avatar","file":"nes/Ultima - Quest of the Avatar (USA).zip","img":"","genre":"retro","emoji":"U","console":"nes","core":"nes"},
  {"title":"Ufouria - The Saga","file":"nes/Ufouria - The Saga (Europe).zip","img":"","genre":"retro","emoji":"U","console":"nes","core":"nes"},
  {"title":"TwinBee 3 - The Aimless Demon King","file":"nes/TwinBee 3 - The Aimless Demon King (Japan) [T-En by Demiforce & Stardust Crusaders v1.01] [n].zip","img":"","genre":"retro","emoji":"T","console":"nes","core":"nes"},
  {"title":"Town & Country Surf Designs - Wood & Water Rage","file":"nes/Town & Country Surf Designs - Wood & Water Rage (USA).zip","img":"","genre":"retro","emoji":"T","console":"nes","core":"nes"},
  {"title":"Town & Country Surf Designs - Thrilla's Surfari","file":"nes/Town & Country Surf Designs - Thrilla's Surfari (USA).zip","img":"","genre":"retro","emoji":"T","console":"nes","core":"nes"},
  {"title":"Tombs & Treasure","file":"nes/Tombs & Treasure (USA).zip","img":"","genre":"retro","emoji":"T","console":"nes","core":"nes"},
  {"title":"Toki","file":"nes/Toki (USA).zip","img":"","genre":"retro","emoji":"T","console":"nes","core":"nes"},
  {"title":"Tiny Toon Adventures 2 - Trouble in Wackyland","file":"nes/Tiny Toon Adventures 2 - Trouble in Wackyland (USA).zip","img":"","genre":"retro","emoji":"T","console":"nes","core":"nes"},
  {"title":"Tiny Toon Adventures","file":"nes/Tiny Toon Adventures (USA).zip","img":"","genre":"retro","emoji":"T","console":"nes","core":"nes"},
  {"title":"Tetris 2","file":"nes/Tetris 2 (USA).zip","img":"","genre":"retro","emoji":"T","console":"nes","core":"nes"},
  {"title":"Tetris","file":"nes/Tetris (USA).zip","img":"","genre":"retro","emoji":"T","console":"nes","core":"nes"},
  {"title":"Terra Cresta","file":"nes/Terra Cresta (USA).zip","img":"","genre":"retro","emoji":"T","console":"nes","core":"nes"},
  {"title":"Teenage Mutant Ninja Turtles III - The Manhattan Project","file":"nes/Teenage Mutant Ninja Turtles III - The Manhattan Project (USA).zip","img":"","genre":"retro","emoji":"T","console":"nes","core":"nes"},
  {"title":"Teenage Mutant Ninja Turtles II - The Arcade Game","file":"nes/Teenage Mutant Ninja Turtles II - The Arcade Game (USA).zip","img":"","genre":"retro","emoji":"T","console":"nes","core":"nes"},
  {"title":"Teenage Mutant Ninja Turtles","file":"nes/Teenage Mutant Ninja Turtles (USA).zip","img":"","genre":"retro","emoji":"T","console":"nes","core":"nes"},
  {"title":"Tecmo World Wrestling","file":"nes/Tecmo World Wrestling (USA).zip","img":"","genre":"retro","emoji":"T","console":"nes","core":"nes"},
  {"title":"Tecmo Super Bowl","file":"nes/Tecmo Super Bowl (USA).zip","img":"","genre":"retro","emoji":"T","console":"nes","core":"nes"},
  {"title":"Tecmo Bowl","file":"nes/Tecmo Bowl (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"T","console":"nes","core":"nes"},
  {"title":"Sword Master","file":"nes/Sword Master (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Sweet Home","file":"nes/Sweet Home (Japan) [T-En by TheSiege v2.0] [n].zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Super Spy Hunter","file":"nes/Super Spy Hunter (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Super Spike V'Ball","file":"nes/Super Spike V'Ball (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Super Mario Bros. 3","file":"nes/Super Mario Bros. 3 (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Super Mario Bros. 2","file":"nes/Super Mario Bros. 2 (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Super Mario Bros. 2","file":"nes/Super Mario Bros. 2 (Japan) (En).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Super Mario Bros.","file":"nes/Super Mario Bros. (World).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Super Dodge Ball","file":"nes/Super Dodge Ball (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Super C","file":"nes/Super C (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"StarTropics","file":"nes/StarTropics (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Star Wars","file":"nes/Star Wars (Japan) (Namco) [T-En by Gil Galad v1.10].zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Spot - The Video Game","file":"nes/Spot - The Video Game (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Splatter House - Super Deformed","file":"nes/Splatter House - Super Deformed (Japan) [T-En by Spinner 8 and friends v2.00] [n].zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Solomon's Key","file":"nes/Solomon's Key (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Snake's Revenge","file":"nes/Snake's Revenge (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Snake Rattle n Roll","file":"nes/Snake Rattle n Roll (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Smash T.V.","file":"nes/Smash T.V. (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Sky Kid","file":"nes/Sky Kid (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Silk Worm","file":"nes/Silk Worm (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Side Pocket","file":"nes/Side Pocket (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Shatterhand","file":"nes/Shatterhand (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Shadowgate","file":"nes/Shadowgate (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Shadow of the Ninja","file":"nes/Shadow of the Ninja (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Samurai Pizza Cats","file":"nes/Samurai Pizza Cats (Japan) [T-En by Vice Translations v1.01] [US adaptation] [n].zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"S.C.A.T. - Special Cybernetic Attack Team","file":"nes/S.C.A.T. - Special Cybernetic Attack Team (USA).zip","img":"","genre":"retro","emoji":"S","console":"nes","core":"nes"},
  {"title":"Rygar","file":"nes/Rygar (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"R","console":"nes","core":"nes"},
  {"title":"Rush'n Attack","file":"nes/Rush'n Attack (USA).zip","img":"","genre":"retro","emoji":"R","console":"nes","core":"nes"},
  {"title":"Romance of the Three Kingdoms II","file":"nes/Romance of the Three Kingdoms II (USA).zip","img":"","genre":"retro","emoji":"R","console":"nes","core":"nes"},
  {"title":"Romance of the Three Kingdoms","file":"nes/Romance of the Three Kingdoms (USA).zip","img":"","genre":"retro","emoji":"R","console":"nes","core":"nes"},
  {"title":"Rolling Thunder","file":"nes/Rolling Thunder (World) (Namcot Collection, Namco Museum Archives Vol 2).zip","img":"","genre":"retro","emoji":"R","console":"nes","core":"nes"},
  {"title":"Rollergames","file":"nes/Rollergames (USA).zip","img":"","genre":"retro","emoji":"R","console":"nes","core":"nes"},
  {"title":"Rodland","file":"nes/Rodland (Europe).zip","img":"","genre":"retro","emoji":"R","console":"nes","core":"nes"},
  {"title":"Rockin' Kats","file":"nes/Rockin' Kats (USA).zip","img":"","genre":"retro","emoji":"R","console":"nes","core":"nes"},
  {"title":"River City Ransom","file":"nes/River City Ransom (USA).zip","img":"","genre":"retro","emoji":"R","console":"nes","core":"nes"},
  {"title":"Ring King","file":"nes/Ring King (USA).zip","img":"","genre":"retro","emoji":"R","console":"nes","core":"nes"},
  {"title":"Rescue - The Embassy Mission","file":"nes/Rescue - The Embassy Mission (USA).zip","img":"","genre":"retro","emoji":"R","console":"nes","core":"nes"},
  {"title":"Rampart","file":"nes/Rampart (USA) (Jaleco).zip","img":"","genre":"retro","emoji":"R","console":"nes","core":"nes"},
  {"title":"Rainbow Islands - Bubble Bobble 2","file":"nes/Rainbow Islands - Bubble Bobble 2 (Europe).zip","img":"","genre":"retro","emoji":"R","console":"nes","core":"nes"},
  {"title":"Raging Fire - Recca","file":"nes/Raging Fire - Recca (Japan) [T-En by Aeon Genesis v1.00] [n].zip","img":"","genre":"retro","emoji":"R","console":"nes","core":"nes"},
  {"title":"R.C. Pro-Am II","file":"nes/R.C. Pro-Am II (USA).zip","img":"","genre":"retro","emoji":"R","console":"nes","core":"nes"},
  {"title":"R.C. Pro-Am","file":"nes/R.C. Pro-Am (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"R","console":"nes","core":"nes"},
  {"title":"QIX","file":"nes/QIX (USA).zip","img":"","genre":"retro","emoji":"Q","console":"nes","core":"nes"},
  {"title":"Pro Wrestling","file":"nes/Pro Wrestling (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"P","console":"nes","core":"nes"},
  {"title":"Princess Tomato in the Salad Kingdom","file":"nes/Princess Tomato in the Salad Kingdom (USA).zip","img":"","genre":"retro","emoji":"P","console":"nes","core":"nes"},
  {"title":"Power Blade 2","file":"nes/Power Blade 2 (USA).zip","img":"","genre":"retro","emoji":"P","console":"nes","core":"nes"},
  {"title":"Power Blade","file":"nes/Power Blade (USA).zip","img":"","genre":"retro","emoji":"P","console":"nes","core":"nes"},
  {"title":"Pizza Pop!","file":"nes/Pizza Pop! (Japan) [T-En by Pacnsacdave v1.0].zip","img":"","genre":"retro","emoji":"P","console":"nes","core":"nes"},
  {"title":"Pirates!","file":"nes/Pirates! (USA).zip","img":"","genre":"retro","emoji":"P","console":"nes","core":"nes"},
  {"title":"Pinball Quest","file":"nes/Pinball Quest (USA).zip","img":"","genre":"retro","emoji":"P","console":"nes","core":"nes"},
  {"title":"Perman 2 - Down with the Secret Madou Society!","file":"nes/Perman 2 - Down with the Secret Madou Society! (Japan) [T-En by KingMike's Translations v1.0] [Add by FlashPV] [n].zip","img":"","genre":"retro","emoji":"P","console":"nes","core":"nes"},
  {"title":"Perman - Return the Space Saucer!","file":"nes/Perman - Return the Space Saucer! (Japan) [T-En by Zynk Oxhyde v2.0] [n].zip","img":"","genre":"retro","emoji":"P","console":"nes","core":"nes"},
  {"title":"Parodius","file":"nes/Parodius (Europe).zip","img":"","genre":"retro","emoji":"P","console":"nes","core":"nes"},
  {"title":"Panic Restaurant","file":"nes/Panic Restaurant (USA).zip","img":"","genre":"retro","emoji":"P","console":"nes","core":"nes"},
  {"title":"Palamedes","file":"nes/Palamedes (USA).zip","img":"","genre":"retro","emoji":"P","console":"nes","core":"nes"},
  {"title":"Over Horizon","file":"nes/Over Horizon (Europe).zip","img":"","genre":"retro","emoji":"O","console":"nes","core":"nes"},
  {"title":"North and South","file":"nes/North and South (USA).zip","img":"","genre":"retro","emoji":"N","console":"nes","core":"nes"},
  {"title":"Nobunaga's Ambition II","file":"nes/Nobunaga's Ambition II (USA).zip","img":"","genre":"retro","emoji":"N","console":"nes","core":"nes"},
  {"title":"Nobunaga's Ambition","file":"nes/Nobunaga's Ambition (USA).zip","img":"","genre":"retro","emoji":"N","console":"nes","core":"nes"},
  {"title":"Noah's Ark","file":"nes/Noah's Ark (Europe).zip","img":"","genre":"retro","emoji":"N","console":"nes","core":"nes"},
  {"title":"Nintendo World Cup","file":"nes/Nintendo World Cup (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"N","console":"nes","core":"nes"},
  {"title":"Ninja Gaiden III - The Ancient Ship of Doom","file":"nes/Ninja Gaiden III - The Ancient Ship of Doom (USA).zip","img":"","genre":"retro","emoji":"N","console":"nes","core":"nes"},
  {"title":"Ninja Gaiden II - The Dark Sword of Chaos","file":"nes/Ninja Gaiden II - The Dark Sword of Chaos (USA).zip","img":"","genre":"retro","emoji":"N","console":"nes","core":"nes"},
  {"title":"Ninja Gaiden","file":"nes/Ninja Gaiden (USA).zip","img":"","genre":"retro","emoji":"N","console":"nes","core":"nes"},
  {"title":"New Ghostbusters II","file":"nes/New Ghostbusters II (Europe).zip","img":"","genre":"retro","emoji":"N","console":"nes","core":"nes"},
  {"title":"NES Open Tournament Golf","file":"nes/NES Open Tournament Golf (USA).zip","img":"","genre":"retro","emoji":"N","console":"nes","core":"nes"},
  {"title":"Nekketsu! Street Basket - Go for it, Dunk Heroes!","file":"nes/Nekketsu! Street Basket - Go for it, Dunk Heroes! (Japan) [T-En by Farid v1.2] [n].zip","img":"","genre":"retro","emoji":"N","console":"nes","core":"nes"},
  {"title":"Mysterious Murasame Castle, The","file":"nes/Mysterious Murasame Castle, The (Japan) [T-En by Spinner 8 and friends v1.1] [n].zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Mr. Gimmick","file":"nes/Mr. Gimmick (Europe).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Moon Crystal","file":"nes/Moon Crystal (Japan) [T-En by Alex W. Jackson v1.0].zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Monster Party","file":"nes/Monster Party (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Monster in My Pocket","file":"nes/Monster in My Pocket (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Monopoly","file":"nes/Monopoly (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Mitsume ga Tooru","file":"nes/Mitsume ga Tooru (Japan) [T-En by The Spoony Bard v1.01].zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Mike Tyson's Punch-Out!!","file":"nes/Mike Tyson's Punch-Out!! (Japan, USA) (Rev 1).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Mighty Final Fight","file":"nes/Mighty Final Fight (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Micro Machines","file":"nes/Micro Machines (USA) (Unl).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Metroid","file":"nes/Metroid (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Metal Storm","file":"nes/Metal Storm (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Metal Slader Glory","file":"nes/Metal Slader Glory (Japan) [T-En by Stardust Crusaders v1.0].zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Metal Gear","file":"nes/Metal Gear (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Mendel Palace","file":"nes/Mendel Palace (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Mega Man 6","file":"nes/Mega Man 6 (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Mega Man 5","file":"nes/Mega Man 5 (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Mega Man 4","file":"nes/Mega Man 4 (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Mega Man 3","file":"nes/Mega Man 3 (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Mega Man 2","file":"nes/Mega Man 2 (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Mega Man","file":"nes/Mega Man (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Marble Madness","file":"nes/Marble Madness (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Mappy-Land","file":"nes/Mappy-Land (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Maniac Mansion","file":"nes/Maniac Mansion (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Magic of Scheherazade, The","file":"nes/Magic of Scheherazade, The (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Mafat Conspiracy, The","file":"nes/Mafat Conspiracy, The (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"M.C. Kids","file":"nes/M.C. Kids (USA).zip","img":"","genre":"retro","emoji":"M","console":"nes","core":"nes"},
  {"title":"Low G Man - The Low Gravity Man","file":"nes/Low G Man - The Low Gravity Man (USA).zip","img":"","genre":"retro","emoji":"L","console":"nes","core":"nes"},
  {"title":"Lone Ranger, The","file":"nes/Lone Ranger, The (USA).zip","img":"","genre":"retro","emoji":"L","console":"nes","core":"nes"},
  {"title":"Little Samson","file":"nes/Little Samson (USA).zip","img":"","genre":"retro","emoji":"L","console":"nes","core":"nes"},
  {"title":"Little Ninja Brothers","file":"nes/Little Ninja Brothers (USA).zip","img":"","genre":"retro","emoji":"L","console":"nes","core":"nes"},
  {"title":"Little Nemo - The Dream Master","file":"nes/Little Nemo - The Dream Master (USA).zip","img":"","genre":"retro","emoji":"L","console":"nes","core":"nes"},
  {"title":"Life Force","file":"nes/Life Force (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"L","console":"nes","core":"nes"},
  {"title":"Legendary Wings","file":"nes/Legendary Wings (USA).zip","img":"","genre":"retro","emoji":"L","console":"nes","core":"nes"},
  {"title":"Legend of Zelda, The","file":"nes/Legend of Zelda, The (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"L","console":"nes","core":"nes"},
  {"title":"Legend of Fuma, The","file":"nes/Legend of Fuma, The [Japan] [T-En by Nebulous Translations v1.01] [n].zip","img":"","genre":"retro","emoji":"L","console":"nes","core":"nes"},
  {"title":"Legacy of the Wizard","file":"nes/Legacy of the Wizard (USA).zip","img":"","genre":"retro","emoji":"L","console":"nes","core":"nes"},
  {"title":"Kung-Fu Heroes","file":"nes/Kung-Fu Heroes (USA).zip","img":"","genre":"retro","emoji":"K","console":"nes","core":"nes"},
  {"title":"Kung Fu","file":"nes/Kung Fu (Japan, USA).zip","img":"","genre":"retro","emoji":"K","console":"nes","core":"nes"},
  {"title":"Krion Conquest, The","file":"nes/Krion Conquest, The (USA).zip","img":"","genre":"retro","emoji":"K","console":"nes","core":"nes"},
  {"title":"Krazy Kreatures","file":"nes/Krazy Kreatures (USA) (Rev A) (Unl).zip","img":"","genre":"retro","emoji":"K","console":"nes","core":"nes"},
  {"title":"Klax","file":"nes/Klax (USA) (Unl).zip","img":"","genre":"retro","emoji":"K","console":"nes","core":"nes"},
  {"title":"Kiwi Kraze - A Bird-Brained Adventure!","file":"nes/Kiwi Kraze - A Bird-Brained Adventure! (USA).zip","img":"","genre":"retro","emoji":"K","console":"nes","core":"nes"},
  {"title":"Kirby's Adventure","file":"nes/Kirby's Adventure (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"K","console":"nes","core":"nes"},
  {"title":"Kid Niki 3","file":"nes/Kid Niki 3 (Japan) [T-En by Suicidal Translations v1.00] [Add by MottZilla v1.0] [Add by Proveaux v1.0] [n].zip","img":"","genre":"retro","emoji":"K","console":"nes","core":"nes"},
  {"title":"Kid Klown in Night Mayor World","file":"nes/Kid Klown in Night Mayor World (USA).zip","img":"","genre":"retro","emoji":"K","console":"nes","core":"nes"},
  {"title":"Kid Icarus","file":"nes/Kid Icarus (USA, Europe) (Rev 1).zip","img":"","genre":"retro","emoji":"K","console":"nes","core":"nes"},
  {"title":"Kid Dracula","file":"nes/Kid Dracula (World) (Castlevania Anniversary Collection).zip","img":"","genre":"retro","emoji":"K","console":"nes","core":"nes"},
  {"title":"KickMaster","file":"nes/KickMaster (USA).zip","img":"","genre":"retro","emoji":"K","console":"nes","core":"nes"},
  {"title":"Kickle Cubicle","file":"nes/Kickle Cubicle (USA).zip","img":"","genre":"retro","emoji":"K","console":"nes","core":"nes"},
  {"title":"Kaiketsu Yancha Maru 2 - Karakuri Land","file":"nes/Kaiketsu Yancha Maru 2 - Karakuri Land (Japan) [T-En by Derrick Sobodash v1.2].zip","img":"","genre":"retro","emoji":"K","console":"nes","core":"nes"},
  {"title":"Kabuki - Quantum Fighter","file":"nes/Kabuki - Quantum Fighter (USA).zip","img":"","genre":"retro","emoji":"K","console":"nes","core":"nes"},
  {"title":"Just Breed","file":"nes/Just Breed (Japan) [T-En by Stealth Translations v1.00].zip","img":"","genre":"retro","emoji":"J","console":"nes","core":"nes"},
  {"title":"Joy Mech Fight","file":"nes/Joy Mech Fight (Japan) [T-En by AlanMidas joy.mech] [n].zip","img":"","genre":"retro","emoji":"J","console":"nes","core":"nes"},
  {"title":"Journey to Silius","file":"nes/Journey to Silius (USA).zip","img":"","genre":"retro","emoji":"J","console":"nes","core":"nes"},
  {"title":"Jetsons, The - Cogswell's Caper","file":"nes/Jetsons, The - Cogswell's Caper (USA).zip","img":"","genre":"retro","emoji":"J","console":"nes","core":"nes"},
  {"title":"Jackie Chan's Action Kung Fu","file":"nes/Jackie Chan's Action Kung Fu (USA).zip","img":"","genre":"retro","emoji":"J","console":"nes","core":"nes"},
  {"title":"Jackal","file":"nes/Jackal (USA).zip","img":"","genre":"retro","emoji":"J","console":"nes","core":"nes"},
  {"title":"Ivan 'Ironman' Stewart's Super Off Road","file":"nes/Ivan 'Ironman' Stewart's Super Off Road (USA).zip","img":"","genre":"retro","emoji":"I","console":"nes","core":"nes"},
  {"title":"Iron Tank - The Invasion of Normandy","file":"nes/Iron Tank - The Invasion of Normandy (USA).zip","img":"","genre":"retro","emoji":"I","console":"nes","core":"nes"},
  {"title":"Ice Hockey","file":"nes/Ice Hockey (USA).zip","img":"","genre":"retro","emoji":"I","console":"nes","core":"nes"},
  {"title":"Ice Climber","file":"nes/Ice Climber (USA, Europe, Korea).zip","img":"","genre":"retro","emoji":"I","console":"nes","core":"nes"},
  {"title":"Hudson's Adventure Island IV","file":"nes/Hudson's Adventure Island IV (Japan) [T-En by Zynk Oxhyde v1.0] [n].zip","img":"","genre":"retro","emoji":"H","console":"nes","core":"nes"},
  {"title":"Holy Diver","file":"nes/Holy Diver (Japan) [T-En by Monaco v1.0] [Add by MottZilla R1].zip","img":"","genre":"retro","emoji":"H","console":"nes","core":"nes"},
  {"title":"Heavy Barrel","file":"nes/Heavy Barrel (USA).zip","img":"","genre":"retro","emoji":"H","console":"nes","core":"nes"},
  {"title":"Hammerin' Harry","file":"nes/Hammerin' Harry (Europe).zip","img":"","genre":"retro","emoji":"H","console":"nes","core":"nes"},
  {"title":"Gyruss","file":"nes/Gyruss (USA).zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Gun.Smoke","file":"nes/Gun.Smoke (USA).zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Gun Nac","file":"nes/Gun Nac (USA).zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Guerrilla War","file":"nes/Guerrilla War (USA).zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Guardian Legend, The","file":"nes/Guardian Legend, The (USA).zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Gremlins 2 - The New Batch","file":"nes/Gremlins 2 - The New Batch (USA).zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Gradius II","file":"nes/Gradius II (Japan).zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Gradius","file":"nes/Gradius (USA).zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Goonies II, The","file":"nes/Goonies II, The (USA).zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Golgo 13 - Top Secret Episode","file":"nes/Golgo 13 - Top Secret Episode (USA).zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Go Go! Nekketu Hockey Club - Multi-Sport Battle","file":"nes/Go Go! Nekketu Hockey Club - Multi-Sport Battle (Japan) [T-En by Disconnected Translations v0.99] [Add by GAFF Translations v1.00] [n].zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Go for it! Goemon 2","file":"nes/Go for it! Goemon 2 (Japan) [T-En by Stardust Crusaders v2.00] [n].zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Ghosts'n Goblins","file":"nes/Ghosts'n Goblins (USA).zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Ghost Lion","file":"nes/Ghost Lion (USA).zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Genghis Khan","file":"nes/Genghis Khan (USA).zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Gemfire","file":"nes/Gemfire (USA).zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Gargoyle's Quest II","file":"nes/Gargoyle's Quest II (USA).zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Ganbare Goemon!","file":"nes/Ganbare Goemon! (Japan) [T-En by Spinner 8 and friends v1.01] [n].zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Ganbare Goemon Gaiden 2 - Treasures of the World","file":"nes/Ganbare Goemon Gaiden 2 - Treasures of the World (Japan) [T-En by Adventurous Translations v1.01] [n].zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Ganbare Goemon Gaiden - The Missing Golden Pipe","file":"nes/Ganbare Goemon Gaiden - The Missing Golden Pipe (Japan) [T-En by Adventurous Translations v0.99c] [n].zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"G.I. Joe - A Real American Hero","file":"nes/G.I. Joe - A Real American Hero (USA).zip","img":"","genre":"retro","emoji":"G","console":"nes","core":"nes"},
  {"title":"Flintstones, The - The Surprise at Dinosaur Peak!","file":"nes/Flintstones, The - The Surprise at Dinosaur Peak! (USA).zip","img":"","genre":"retro","emoji":"F","console":"nes","core":"nes"},
  {"title":"Flintstones, The - The Rescue of Dino & Hoppy","file":"nes/Flintstones, The - The Rescue of Dino & Hoppy (USA).zip","img":"","genre":"retro","emoji":"F","console":"nes","core":"nes"},
  {"title":"Fire 'n Ice","file":"nes/Fire 'n Ice (USA).zip","img":"","genre":"retro","emoji":"F","console":"nes","core":"nes"},
  {"title":"Fire Emblem Gaiden","file":"nes/Fire Emblem Gaiden (Japan) [T-En by Artemis251 v1.01].zip","img":"","genre":"retro","emoji":"F","console":"nes","core":"nes"},
  {"title":"Fire Emblem - Shadow Dragon and the Blade of Light","file":"nes/Fire Emblem - Shadow Dragon and the Blade of Light (Japan) [T-En by Polinym v1.2] [n].zip","img":"","genre":"retro","emoji":"F","console":"nes","core":"nes"},
  {"title":"Final Fantasy III","file":"nes/Final Fantasy III (Japan) [T-En by Chaos Rush v1.3].zip","img":"","genre":"retro","emoji":"F","console":"nes","core":"nes"},
  {"title":"Final Fantasy II","file":"nes/Final Fantasy II (Japan) [T-En by Demiforce v1.03] [Add by Chaos Rush v2.2b].zip","img":"","genre":"retro","emoji":"F","console":"nes","core":"nes"},
  {"title":"Final Fantasy","file":"nes/Final Fantasy (USA).zip","img":"","genre":"retro","emoji":"F","console":"nes","core":"nes"},
  {"title":"Fester's Quest","file":"nes/Fester's Quest (USA).zip","img":"","genre":"retro","emoji":"F","console":"nes","core":"nes"},
  {"title":"Felix the Cat","file":"nes/Felix the Cat (USA).zip","img":"","genre":"retro","emoji":"F","console":"nes","core":"nes"},
  {"title":"Faxanadu","file":"nes/Faxanadu (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"F","console":"nes","core":"nes"},
  {"title":"Famicom Wars","file":"nes/Famicom Wars (Japan) [T-En by Aka Translations v1.11].zip","img":"","genre":"retro","emoji":"F","console":"nes","core":"nes"},
  {"title":"Excitebike","file":"nes/Excitebike (Japan, USA).zip","img":"","genre":"retro","emoji":"E","console":"nes","core":"nes"},
  {"title":"Elite","file":"nes/Elite (Europe) (En,Fr,De).zip","img":"","genre":"retro","emoji":"E","console":"nes","core":"nes"},
  {"title":"EarthBound Beginnings","file":"nes/EarthBound Beginnings (USA, Europe) (Virtual Console).zip","img":"","genre":"retro","emoji":"E","console":"nes","core":"nes"},
  {"title":"DuckTales 2","file":"nes/DuckTales 2 (USA).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"DuckTales","file":"nes/DuckTales (USA).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Dragon Warrior IV","file":"nes/Dragon Warrior IV (USA).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Dragon Warrior III","file":"nes/Dragon Warrior III (USA).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Dragon Warrior II","file":"nes/Dragon Warrior II (USA).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Dragon Warrior","file":"nes/Dragon Warrior (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Dragon Spirit - The New Legend","file":"nes/Dragon Spirit - The New Legend (USA).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Dragon Fighter","file":"nes/Dragon Fighter (USA).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Dr. Mario","file":"nes/Dr. Mario (Japan, USA) (Rev 1).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Downtown Special - Kunio-kun no Jidaigeki Dayo Zenin Shuugou!","file":"nes/Downtown Special - Kunio-kun no Jidaigeki Dayo Zenin Shuugou! (J) [T Eng1.0_TechnosSamuraiTeam].zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Double Dragon III - The Sacred Stones","file":"nes/Double Dragon III - The Sacred Stones (USA).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Double Dragon II - The Revenge","file":"nes/Double Dragon II - The Revenge (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Double Dragon","file":"nes/Double Dragon (USA).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Door Door","file":"nes/Door Door (Japan).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Donkey Kong Classics","file":"nes/Donkey Kong Classics (USA, Europe).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Digital Devil Story - Megami Tensei II","file":"nes/Digital Devil Story - Megami Tensei II (Japan) (Rev A) [T-En by Stardust Crusaders v1.04].zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Digital Devil Story - Megami Tensei","file":"nes/Digital Devil Story - Megami Tensei (Japan) [T-En by EsperKnight & Stardust Crusaders & Tom v1.0] [n].zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Devil World","file":"nes/Devil World (Europe).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Destiny of an Emperor","file":"nes/Destiny of an Emperor (USA).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Deja Vu","file":"nes/Deja Vu (USA).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"David Crane's A Boy and His Blob - Trouble on Blobolonia","file":"nes/David Crane's A Boy and His Blob - Trouble on Blobolonia (USA).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Darkwing Duck","file":"nes/Darkwing Duck (USA).zip","img":"","genre":"retro","emoji":"D","console":"nes","core":"nes"},
  {"title":"Crystalis","file":"nes/Crystalis (USA).zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Crisis Force","file":"nes/Crisis Force (Japan) [T-En by Stardust Crusaders v1.0].zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Crackout","file":"nes/Crackout (Europe).zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Cowboy Kid","file":"nes/Cowboy Kid (USA).zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Contra","file":"nes/Contra (USA).zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Conquest of the Crystal Palace","file":"nes/Conquest of the Crystal Palace (USA).zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Cocoron","file":"nes/Cocoron (Japan) [T-En by Akujin & Dynamic Designs v1.0].zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Clash at Demonhead","file":"nes/Clash at Demonhead (USA).zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Chronicle of the Radia War v1.00]","file":"nes/Chronicle of the Radia War (Japan) [T-En by Dreamless & Jair & [cx] v1.00] [n].zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Chip 'n Dale - Rescue Rangers 2","file":"nes/Chip 'n Dale - Rescue Rangers 2 (USA).zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Chip 'n Dale - Rescue Rangers","file":"nes/Chip 'n Dale - Rescue Rangers (USA).zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Castlevania III - Dracula's Curse","file":"nes/Castlevania III - Dracula's Curse (USA).zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Castlevania II - Simon's Quest","file":"nes/Castlevania II - Simon's Quest (USA).zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Castlevania","file":"nes/Castlevania (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Castelian","file":"nes/Castelian (USA).zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Captain Tsubasa Vol. II - Super Striker","file":"nes/Captain Tsubasa Vol. II - Super Striker (Japan) [T-En by Hayabusakun v1.0].zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Captain America and the Avengers","file":"nes/Captain America and the Avengers (USA).zip","img":"","genre":"retro","emoji":"C","console":"nes","core":"nes"},
  {"title":"Burai Fighter","file":"nes/Burai Fighter (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Bugs Bunny Crazy Castle, The","file":"nes/Bugs Bunny Crazy Castle, The (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Bugs Bunny Birthday Blowout, The","file":"nes/Bugs Bunny Birthday Blowout, The (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Bucky O'Hare","file":"nes/Bucky O'Hare (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Bubble Bobble Part 2","file":"nes/Bubble Bobble Part 2 (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Bubble Bobble","file":"nes/Bubble Bobble (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Break Time - The National Pool Tour","file":"nes/Break Time - The National Pool Tour (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Bonk's Adventure","file":"nes/Bonk's Adventure (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Bomberman II","file":"nes/Bomberman II (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Bomberman","file":"nes/Bomberman (USA).zip","img":"","genre":"retro","emoji":"B","console":"nes","core":"nes"},
  {"title":"Bonkers","file":"snes/Bonkers (USA).zip","img":"","genre":"retro","emoji":"B","console":"snes","core":"snes"},
  {"title":"BlaZeon - The Bio-Cyborg Challenge","file":"snes/BlaZeon - The Bio-Cyborg Challenge (USA).zip","img":"","genre":"retro","emoji":"B","console":"snes","core":"snes"},
  {"title":"Blackthorne","file":"snes/Blackthorne (USA).zip","img":"","genre":"retro","emoji":"B","console":"snes","core":"snes"},
  {"title":"BioMetal","file":"snes/BioMetal (USA).zip","img":"","genre":"retro","emoji":"B","console":"snes","core":"snes"},
  {"title":"Biker Mice from Mars","file":"snes/Biker Mice from Mars (USA).zip","img":"","genre":"retro","emoji":"B","console":"snes","core":"snes"},
  {"title":"Best of the Best - Championship Karate","file":"snes/Best of the Best - Championship Karate (USA).zip","img":"","genre":"retro","emoji":"B","console":"snes","core":"snes"},
  {"title":"Batman Returns","file":"snes/Batman Returns (USA).zip","img":"","genre":"retro","emoji":"B","console":"snes","core":"snes"},
  {"title":"Bassin's Black Bass","file":"snes/Bassin's Black Bass (USA).zip","img":"","genre":"retro","emoji":"B","console":"snes","core":"snes"},
  {"title":"BASS Masters Classic - Pro Edition","file":"snes/BASS Masters Classic - Pro Edition (USA).zip","img":"","genre":"retro","emoji":"B","console":"snes","core":"snes"},
  {"title":"Bahamut Lagoon","file":"snes/Bahamut Lagoon (Japan) [T-En by Tom & Near v1.2].zip","img":"","genre":"retro","emoji":"B","console":"snes","core":"snes"},
  {"title":"Axelay","file":"snes/Axelay (USA).zip","img":"","genre":"retro","emoji":"A","console":"snes","core":"snes"},
  {"title":"Arkanoid - Doh It Again","file":"snes/Arkanoid - Doh It Again (USA).zip","img":"","genre":"retro","emoji":"A","console":"snes","core":"snes"},
  {"title":"Ardy Lightfoot","file":"snes/Ardy Lightfoot (USA).zip","img":"","genre":"retro","emoji":"A","console":"snes","core":"snes"},
  {"title":"Arcana","file":"snes/Arcana (USA).zip","img":"","genre":"retro","emoji":"A","console":"snes","core":"snes"},
  {"title":"Animaniacs","file":"snes/Animaniacs (USA).zip","img":"","genre":"retro","emoji":"A","console":"snes","core":"snes"},
  {"title":"American Tail, An - Fievel Goes West","file":"snes/American Tail, An - Fievel Goes West (USA).zip","img":"","genre":"retro","emoji":"A","console":"snes","core":"snes"},
  {"title":"Amazing Spider-Man, The - Lethal Foes","file":"snes/Amazing Spider-Man, The - Lethal Foes (Japan) [T-En by Gorgyrip v1.0].zip","img":"","genre":"retro","emoji":"A","console":"snes","core":"snes"},
  {"title":"Alien vs Predator","file":"snes/Alien vs Predator (USA).zip","img":"","genre":"retro","emoji":"A","console":"snes","core":"snes"},
  {"title":"Alien 3","file":"snes/Alien 3 (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"A","console":"snes","core":"snes"},
  {"title":"Aladdin","file":"snes/Aladdin (USA).zip","img":"","genre":"retro","emoji":"A","console":"snes","core":"snes"},
  {"title":"Aerobiz Supersonic","file":"snes/Aerobiz Supersonic (USA).zip","img":"","genre":"retro","emoji":"A","console":"snes","core":"snes"},
  {"title":"Aerobiz","file":"snes/Aerobiz (USA).zip","img":"","genre":"retro","emoji":"A","console":"snes","core":"snes"},
  {"title":"Aero Fighters","file":"snes/Aero Fighters (USA).zip","img":"","genre":"retro","emoji":"A","console":"snes","core":"snes"},
  {"title":"Adventures of Batman & Robin, The","file":"snes/Adventures of Batman & Robin, The (USA).zip","img":"","genre":"retro","emoji":"A","console":"snes","core":"snes"},
  {"title":"ActRaiser 2","file":"snes/ActRaiser 2 (USA).zip","img":"","genre":"retro","emoji":"A","console":"snes","core":"snes"},
  {"title":"ActRaiser","file":"snes/ActRaiser (USA).zip","img":"","genre":"retro","emoji":"A","console":"snes","core":"snes"},
  {"title":"Zoop","file":"snes/Zoop (USA).zip","img":"","genre":"retro","emoji":"Z","console":"snes","core":"snes"},
  {"title":"Zombies Ate My Neighbors","file":"snes/Zombies Ate My Neighbors (USA).zip","img":"","genre":"retro","emoji":"Z","console":"snes","core":"snes"},
  {"title":"Ys III - Wanderers from Ys","file":"snes/Ys III - Wanderers from Ys (USA).zip","img":"","genre":"retro","emoji":"Y","console":"snes","core":"snes"},
  {"title":"Young Merlin","file":"snes/Young Merlin (USA).zip","img":"","genre":"retro","emoji":"Y","console":"snes","core":"snes"},
  {"title":"Yoshi's Cookie","file":"snes/Yoshi's Cookie (USA).zip","img":"","genre":"retro","emoji":"Y","console":"snes","core":"snes"},
  {"title":"X-Men - Mutant Apocalypse","file":"snes/X-Men - Mutant Apocalypse (USA).zip","img":"","genre":"retro","emoji":"X","console":"snes","core":"snes"},
  {"title":"X-Kaliber 2097","file":"snes/X-Kaliber 2097 (USA).zip","img":"","genre":"retro","emoji":"X","console":"snes","core":"snes"},
  {"title":"WWF WrestleMania - The Arcade Game","file":"snes/WWF WrestleMania - The Arcade Game (USA).zip","img":"","genre":"retro","emoji":"W","console":"snes","core":"snes"},
  {"title":"WWF Royal Rumble","file":"snes/WWF Royal Rumble (USA).zip","img":"","genre":"retro","emoji":"W","console":"snes","core":"snes"},
  {"title":"WWF Raw","file":"snes/WWF Raw (USA).zip","img":"","genre":"retro","emoji":"W","console":"snes","core":"snes"},
  {"title":"Wizardry V - Heart of the Maelstrom","file":"snes/Wizardry V - Heart of the Maelstrom (USA).zip","img":"","genre":"retro","emoji":"W","console":"snes","core":"snes"},
  {"title":"Wing Commander","file":"snes/Wing Commander (USA).zip","img":"","genre":"retro","emoji":"W","console":"snes","core":"snes"},
  {"title":"Wing Commander - The Secret Missions","file":"snes/Wing Commander - The Secret Missions (USA).zip","img":"","genre":"retro","emoji":"W","console":"snes","core":"snes"},
  {"title":"Wild Snake","file":"snes/Wild Snake (USA).zip","img":"","genre":"retro","emoji":"W","console":"snes","core":"snes"},
  {"title":"Wild Guns","file":"snes/Wild Guns (USA).zip","img":"","genre":"retro","emoji":"W","console":"snes","core":"snes"},
  {"title":"Whizz","file":"snes/Whizz (USA).zip","img":"","genre":"retro","emoji":"W","console":"snes","core":"snes"},
  {"title":"Whirlo","file":"snes/Whirlo (Europe).zip","img":"","genre":"retro","emoji":"W","console":"snes","core":"snes"},
  {"title":"Where in the World Is Carmen Sandiego","file":"snes/Where in the World Is Carmen Sandiego (USA) (En,Fr,De,Es,It).zip","img":"","genre":"retro","emoji":"W","console":"snes","core":"snes"},
  {"title":"WeaponLord","file":"snes/WeaponLord (USA).zip","img":"","genre":"retro","emoji":"W","console":"snes","core":"snes"},
  {"title":"Wario's Woods","file":"snes/Wario's Woods (USA).zip","img":"","genre":"retro","emoji":"W","console":"snes","core":"snes"},
  {"title":"Violinist of Hameln, The","file":"snes/Violinist of Hameln, The (Japan) [T-En by J2e Translations v1.00] [n].zip","img":"","genre":"retro","emoji":"V","console":"snes","core":"snes"},
  {"title":"Vegas Stakes","file":"snes/Vegas Stakes (USA).zip","img":"","genre":"retro","emoji":"V","console":"snes","core":"snes"},
  {"title":"Utopia - The Creation of a Nation","file":"snes/Utopia - The Creation of a Nation (USA).zip","img":"","genre":"retro","emoji":"U","console":"snes","core":"snes"},
  {"title":"Urban Strike","file":"snes/Urban Strike (USA).zip","img":"","genre":"retro","emoji":"U","console":"snes","core":"snes"},
  {"title":"Uniracers","file":"snes/Uniracers (USA).zip","img":"","genre":"retro","emoji":"U","console":"snes","core":"snes"},
  {"title":"Ultimate Mortal Kombat 3","file":"snes/Ultimate Mortal Kombat 3 (USA).zip","img":"","genre":"retro","emoji":"U","console":"snes","core":"snes"},
  {"title":"Ultima - The False Prophet","file":"snes/Ultima - The False Prophet (USA).zip","img":"","genre":"retro","emoji":"U","console":"snes","core":"snes"},
  {"title":"Ultima - The Black Gate","file":"snes/Ultima - The Black Gate (USA).zip","img":"","genre":"retro","emoji":"U","console":"snes","core":"snes"},
  {"title":"Ultima - Runes of Virtue II","file":"snes/Ultima - Runes of Virtue II (USA).zip","img":"","genre":"retro","emoji":"U","console":"snes","core":"snes"},
  {"title":"U.N. Squadron","file":"snes/U.N. Squadron (USA).zip","img":"","genre":"retro","emoji":"U","console":"snes","core":"snes"},
  {"title":"Twisted Tales of Spike McFang, The","file":"snes/Twisted Tales of Spike McFang, The (USA).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Turn and Burn - No-Fly Zone","file":"snes/Turn and Burn - No-Fly Zone (USA).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"True Lies","file":"snes/True Lies (USA).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Troddlers","file":"snes/Troddlers (USA).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Trials of Mana","file":"snes/Trials of Mana (World) (Rev 1) (Collection of Mana).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Toy Story","file":"snes/Toy Story (USA).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Total Carnage","file":"snes/Total Carnage (USA).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Torneco no Daibouken - Fushigi no Dungeon","file":"snes/Torneco no Daibouken - Fushigi no Dungeon (Japan) [T-En by Dynamic Designs v0.99].zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Top Gear 3000","file":"snes/Top Gear 3000 (USA).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Top Gear 2","file":"snes/Top Gear 2 (USA).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Top Gear","file":"snes/Top Gear (USA).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Tiny Toon Adventures - Wacky Sports Challenge","file":"snes/Tiny Toon Adventures - Wacky Sports Challenge (USA).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Tiny Toon Adventures - Buster Busts Loose!","file":"snes/Tiny Toon Adventures - Buster Busts Loose! (USA).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Tetris Attack","file":"snes/Tetris Attack (USA) (En,Ja).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Tetris 2","file":"snes/Tetris 2 (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Tetris & Dr. Mario","file":"snes/Tetris & Dr. Mario (USA).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Terranigma","file":"snes/Terranigma (Europe).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Teenage Mutant Ninja Turtles IV - Turtles in Time","file":"snes/Teenage Mutant Ninja Turtles IV - Turtles in Time (USA).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Teenage Mutant Ninja Turtles - Tournament Fighters","file":"snes/Teenage Mutant Ninja Turtles - Tournament Fighters (USA).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Tecmo Super Bowl III - Final Edition","file":"snes/Tecmo Super Bowl III - Final Edition (USA).zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Tales of Phantasia","file":"snes/Tales of Phantasia (Japan) [T-En by DeJap v1.2].zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Tactics Ogre - Let Us Cling Together","file":"snes/Tactics Ogre - Let Us Cling Together (Japan) (Rev 2) [T-En by Aeon Genesis v1.00b].zip","img":"","genre":"retro","emoji":"T","console":"snes","core":"snes"},
  {"title":"Syndicate","file":"snes/Syndicate (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"SWAT Kats - The Radical Squadron","file":"snes/SWAT Kats - The Radical Squadron (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Turrican 2","file":"snes/Super Turrican 2 (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Turrican","file":"snes/Super Turrican (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Tennis","file":"snes/Super Tennis (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Street Fighter II","file":"snes/Super Street Fighter II (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Star Wars","file":"snes/Super Star Wars (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Star Wars - The Empire Strikes Back","file":"snes/Super Star Wars - The Empire Strikes Back (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Star Wars - Return of the Jedi","file":"snes/Super Star Wars - Return of the Jedi (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Smash T.V.","file":"snes/Super Smash T.V. (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super R-Type","file":"snes/Super R-Type (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Punch-Out!!","file":"snes/Super Punch-Out!! (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Off Road","file":"snes/Super Off Road (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Ninja Boy","file":"snes/Super Ninja Boy (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Morph","file":"snes/Super Morph (Europe).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Metroid","file":"snes/Super Metroid (Japan, USA) (En,Ja).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Mario World 2 - Yoshi's Island","file":"snes/Super Mario World 2 - Yoshi's Island (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Mario World","file":"snes/Super Mario World (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Mario RPG - Legend of the Seven Stars","file":"snes/Super Mario RPG - Legend of the Seven Stars (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Mario Kart","file":"snes/Super Mario Kart (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Mario All-Stars","file":"snes/Super Mario All-Stars (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Ghouls 'N Ghosts","file":"snes/Super Ghouls 'N Ghosts (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Famicom Wars","file":"snes/Super Famicom Wars (Japan) (NP) [T-En by Optiroc v1.1].zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Double Dragon","file":"snes/Super Double Dragon (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Castlevania IV","file":"snes/Super Castlevania IV (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Buster Bros.","file":"snes/Super Buster Bros. (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Bowling","file":"snes/Super Bowling (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Bonk","file":"snes/Super Bonk (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Bomberman 3","file":"snes/Super Bomberman 3 (Europe).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Bomberman 2","file":"snes/Super Bomberman 2 (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Bomberman","file":"snes/Super Bomberman (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Adventure Island II","file":"snes/Super Adventure Island II (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Super Adventure Island","file":"snes/Super Adventure Island (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Sunset Riders","file":"snes/Sunset Riders (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Stunt Race FX","file":"snes/Stunt Race FX (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Strike Gunner S.T.G","file":"snes/Strike Gunner S.T.G (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Street Fighter II Turbo","file":"snes/Street Fighter II Turbo (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Street Fighter Alpha 2","file":"snes/Street Fighter Alpha 2 (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Star Ocean","file":"snes/Star Ocean (Japan) [T-En by DeJap v1.0].zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Star Fox 2","file":"snes/Star Fox 2 (USA, Europe).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Star Fox","file":"snes/Star Fox (USA) (Rev 2).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Spindizzy Worlds","file":"snes/Spindizzy Worlds (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Spider-Man - Venom - Maximum Carnage","file":"snes/Spider-Man - Venom - Maximum Carnage (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Speed Racer","file":"snes/Speed Racer (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Sparkster","file":"snes/Sparkster (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Spanky's Quest","file":"snes/Spanky's Quest (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Space Megaforce","file":"snes/Space Megaforce (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Soul Blazer","file":"snes/Soul Blazer (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Sonic Blast Man II","file":"snes/Sonic Blast Man II (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Sonic Blast Man","file":"snes/Sonic Blast Man (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Soldiers of Fortune","file":"snes/Soldiers of Fortune (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Smash Tennis","file":"snes/Smash Tennis (Europe).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Skyblazer","file":"snes/Skyblazer (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"SimCity 2000 - The Ultimate City Simulator","file":"snes/SimCity 2000 - The Ultimate City Simulator (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"SimCity","file":"snes/SimCity (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"SimAnt - The Electronic Ant Colony","file":"snes/SimAnt - The Electronic Ant Colony (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Side Pocket","file":"snes/Side Pocket (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Sid Meier's Civilization","file":"snes/Sid Meier's Civilization (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Shin Megami Tensei II","file":"snes/Shin Megami Tensei II (Japan) [T-En by Aeon Genesis v1.00].zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Shin Megami Tensei","file":"snes/Shin Megami Tensei (Japan) [T-En by Aeon Genesis v1.00] [Add by Orden v1.0].zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Shien's Revenge","file":"snes/Shien's Revenge (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Shanghai II - Dragon's Eye","file":"snes/Shanghai II - Dragon's Eye (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Shadowrun","file":"snes/Shadowrun (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Secret of Mana","file":"snes/Secret of Mana (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Secret of Evermore","file":"snes/Secret of Evermore (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Scooby-Doo Mystery","file":"snes/Scooby-Doo Mystery (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Saturday Night Slam Masters","file":"snes/Saturday Night Slam Masters (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"S.O.S - Sink or Swim","file":"snes/S.O.S - Sink or Swim (USA).zip","img":"","genre":"retro","emoji":"S","console":"snes","core":"snes"},
  {"title":"Run Saber","file":"snes/Run Saber (USA).zip","img":"","genre":"retro","emoji":"R","console":"snes","core":"snes"},
  {"title":"R-Type III","file":"snes/R-Type III (USA).zip","img":"","genre":"retro","emoji":"R","console":"snes","core":"snes"},
  {"title":"Romance of the Three Kingdoms IV - Wall of Fire","file":"snes/Romance of the Three Kingdoms IV - Wall of Fire (USA).zip","img":"","genre":"retro","emoji":"R","console":"snes","core":"snes"},
  {"title":"Romance of the Three Kingdoms III - Dragon of Destiny","file":"snes/Romance of the Three Kingdoms III - Dragon of Destiny (USA).zip","img":"","genre":"retro","emoji":"R","console":"snes","core":"snes"},
  {"title":"Romance of the Three Kingdoms II","file":"snes/Romance of the Three Kingdoms II (USA).zip","img":"","genre":"retro","emoji":"R","console":"snes","core":"snes"},
  {"title":"Rocky Rodent","file":"snes/Rocky Rodent (USA).zip","img":"","genre":"retro","emoji":"R","console":"snes","core":"snes"},
  {"title":"Rockman & Forte","file":"snes/Rockman & Forte (Japan) [T-En by Aeon Genesis v1.00].zip","img":"","genre":"retro","emoji":"R","console":"snes","core":"snes"},
  {"title":"Rock N' Roll Racing","file":"snes/Rock N' Roll Racing (USA).zip","img":"","genre":"retro","emoji":"R","console":"snes","core":"snes"},
  {"title":"Robotrek","file":"snes/Robotrek (USA).zip","img":"","genre":"retro","emoji":"R","console":"snes","core":"snes"},
  {"title":"RoboCop versus The Terminator","file":"snes/RoboCop versus The Terminator (USA).zip","img":"","genre":"retro","emoji":"R","console":"snes","core":"snes"},
  {"title":"Riddick Bowe Boxing","file":"snes/Riddick Bowe Boxing (USA).zip","img":"","genre":"retro","emoji":"R","console":"snes","core":"snes"},
  {"title":"Rendering Ranger R2","file":"snes/Rendering Ranger R2 (Japan) (En).zip","img":"","genre":"retro","emoji":"R","console":"snes","core":"snes"},
  {"title":"Rampart","file":"snes/Rampart (USA).zip","img":"","genre":"retro","emoji":"R","console":"snes","core":"snes"},
  {"title":"Radical Rex","file":"snes/Radical Rex (USA).zip","img":"","genre":"retro","emoji":"R","console":"snes","core":"snes"},
  {"title":"Putty Squad","file":"snes/Putty Squad (Europe).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Push-Over","file":"snes/Push-Over (USA).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Prehistorik Man","file":"snes/Prehistorik Man (USA) (En,Fr,Es).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Populous II - Trials of the Olympian Gods","file":"snes/Populous II - Trials of the Olympian Gods (Europe).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Populous","file":"snes/Populous (USA).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Pop'n TwinBee","file":"snes/Pop'n TwinBee (Europe).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Pop'n TwinBee - Rainbow Bell Adventures","file":"snes/Pop'n TwinBee - Rainbow Bell Adventures (Europe).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Pocky & Rocky 2","file":"snes/Pocky & Rocky 2 (USA).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Pocky & Rocky","file":"snes/Pocky & Rocky (USA).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Plok","file":"snes/Plok (USA).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Pinocchio","file":"snes/Pinocchio (USA).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Pilotwings","file":"snes/Pilotwings (USA).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Phantom 2040","file":"snes/Phantom 2040 (USA).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Phalanx","file":"snes/Phalanx (USA).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Parodius","file":"snes/Parodius (Europe).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Paladin's Quest","file":"snes/Paladin's Quest (USA).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Pac-Man 2 - The New Adventures","file":"snes/Pac-Man 2 - The New Adventures (USA).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"P.T.O. II - Pacific Theater of Operations","file":"snes/P.T.O. II - Pacific Theater of Operations (USA).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"P.T.O. - Pacific Theater of Operations","file":"snes/P.T.O. - Pacific Theater of Operations (USA).zip","img":"","genre":"retro","emoji":"P","console":"snes","core":"snes"},
  {"title":"Out of This World","file":"snes/Out of This World (USA).zip","img":"","genre":"retro","emoji":"O","console":"snes","core":"snes"},
  {"title":"Operation Logic Bomb - The Ultimate Search & Destroy","file":"snes/Operation Logic Bomb - The Ultimate Search & Destroy (USA).zip","img":"","genre":"retro","emoji":"O","console":"snes","core":"snes"},
  {"title":"On the Ball","file":"snes/On the Ball (USA).zip","img":"","genre":"retro","emoji":"O","console":"snes","core":"snes"},
  {"title":"Ogre Battle - The March of the Black Queen","file":"snes/Ogre Battle - The March of the Black Queen (USA).zip","img":"","genre":"retro","emoji":"O","console":"snes","core":"snes"},
  {"title":"Nosferatu","file":"snes/Nosferatu (USA).zip","img":"","genre":"retro","emoji":"N","console":"snes","core":"snes"},
  {"title":"Nobunaga's Ambition","file":"snes/Nobunaga's Ambition (USA).zip","img":"","genre":"retro","emoji":"N","console":"snes","core":"snes"},
  {"title":"Ninjawarriors","file":"snes/Ninjawarriors (USA).zip","img":"","genre":"retro","emoji":"N","console":"snes","core":"snes"},
  {"title":"NHL '94","file":"snes/NHL '94 (USA).zip","img":"","genre":"retro","emoji":"N","console":"snes","core":"snes"},
  {"title":"New Horizons","file":"snes/New Horizons (USA).zip","img":"","genre":"retro","emoji":"N","console":"snes","core":"snes"},
  {"title":"NBA Jam - Tournament Edition","file":"snes/NBA Jam - Tournament Edition (USA).zip","img":"","genre":"retro","emoji":"N","console":"snes","core":"snes"},
  {"title":"Mysterious Dungeon 2 - Shiren the Wanderer","file":"snes/Mysterious Dungeon 2 - Shiren the Wanderer (Japan) [T-En by Aeon Genesis v1.00] [n].zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Musya - The Classic Japanese Tale of Horror","file":"snes/Musya - The Classic Japanese Tale of Horror (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Mortal Kombat II","file":"snes/Mortal Kombat II (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Mortal Kombat","file":"snes/Mortal Kombat (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Monopoly","file":"snes/Monopoly (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Mobile Suit Gundam Wing - Endless Duel","file":"snes/Mobile Suit Gundam Wing - Endless Duel (Japan) [T-En by Aeon Genesis v1.00] [n].zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Mighty Morphin Power Rangers","file":"snes/Mighty Morphin Power Rangers (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Mighty Morphin Power Rangers - The Movie","file":"snes/Mighty Morphin Power Rangers - The Movie (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Mighty Morphin Power Rangers - The Fighting Edition","file":"snes/Mighty Morphin Power Rangers - The Fighting Edition (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Might and Magic III - Isles of Terra","file":"snes/Might and Magic III - Isles of Terra (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Might and Magic II","file":"snes/Might and Magic II (Europe).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Mickey's Ultimate Challenge","file":"snes/Mickey's Ultimate Challenge (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Mickey Mania - The Timeless Adventures of Mickey Mouse","file":"snes/Mickey Mania - The Timeless Adventures of Mickey Mouse (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Metal Warriors","file":"snes/Metal Warriors (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Metal Marines","file":"snes/Metal Marines (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Metal Combat - Falcon's Revenge","file":"snes/Metal Combat - Falcon's Revenge (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Mega Man X3","file":"snes/Mega Man X3 (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Mega Man X2","file":"snes/Mega Man X2 (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Mega Man X","file":"snes/Mega Man X (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Mega Man Soccer","file":"snes/Mega Man Soccer (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Mega Man 7","file":"snes/Mega Man 7 (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Maui Mallard in Cold Shadow","file":"snes/Maui Mallard in Cold Shadow (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Mask, The","file":"snes/Mask, The (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Marvel Super Heroes in War of the Gems","file":"snes/Marvel Super Heroes in War of the Gems (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Magical Quest Starring Mickey Mouse, The","file":"snes/Magical Quest Starring Mickey Mouse, The (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Magical Pop'n","file":"snes/Magical Pop'n (Japan) [T-En by Aeon Genesis v1.01].zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Magic Sword","file":"snes/Magic Sword (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Madden NFL '94","file":"snes/Madden NFL '94 (USA).zip","img":"","genre":"retro","emoji":"M","console":"snes","core":"snes"},
  {"title":"Lufia II - Rise of the Sinistrals","file":"snes/Lufia II - Rise of the Sinistrals (USA).zip","img":"","genre":"retro","emoji":"L","console":"snes","core":"snes"},
  {"title":"Lufia & the Fortress of Doom","file":"snes/Lufia & the Fortress of Doom (USA).zip","img":"","genre":"retro","emoji":"L","console":"snes","core":"snes"},
  {"title":"Lucky Luke","file":"snes/Lucky Luke (Europe) (En,Fr,De,Es).zip","img":"","genre":"retro","emoji":"L","console":"snes","core":"snes"},
  {"title":"Lost Vikings, The","file":"snes/Lost Vikings, The (USA).zip","img":"","genre":"retro","emoji":"L","console":"snes","core":"snes"},
  {"title":"Lost Vikings 2","file":"snes/Lost Vikings 2 (USA).zip","img":"","genre":"retro","emoji":"L","console":"snes","core":"snes"},
  {"title":"Lord of Darkness","file":"snes/Lord of Darkness (USA).zip","img":"","genre":"retro","emoji":"L","console":"snes","core":"snes"},
  {"title":"Live A Live","file":"snes/Live A Live (Japan) [T-En by Aeon Genesis v2.00 Deluxe].zip","img":"","genre":"retro","emoji":"L","console":"snes","core":"snes"},
  {"title":"Lion King, The","file":"snes/Lion King, The (USA).zip","img":"","genre":"retro","emoji":"L","console":"snes","core":"snes"},
  {"title":"Liberty or Death","file":"snes/Liberty or Death (USA).zip","img":"","genre":"retro","emoji":"L","console":"snes","core":"snes"},
  {"title":"Legend of Zelda, The - A Link to the Past","file":"snes/Legend of Zelda, The - A Link to the Past (USA).zip","img":"","genre":"retro","emoji":"L","console":"snes","core":"snes"},
  {"title":"Legend of the Mystical Ninja, The","file":"snes/Legend of the Mystical Ninja, The (USA).zip","img":"","genre":"retro","emoji":"L","console":"snes","core":"snes"},
  {"title":"Legend","file":"snes/Legend (USA).zip","img":"","genre":"retro","emoji":"L","console":"snes","core":"snes"},
  {"title":"Knights of the Round","file":"snes/Knights of the Round (USA).zip","img":"","genre":"retro","emoji":"K","console":"snes","core":"snes"},
  {"title":"Kirby's Dream Land 3","file":"snes/Kirby's Dream Land 3 (USA).zip","img":"","genre":"retro","emoji":"K","console":"snes","core":"snes"},
  {"title":"Kirby's Dream Course","file":"snes/Kirby's Dream Course (USA).zip","img":"","genre":"retro","emoji":"K","console":"snes","core":"snes"},
  {"title":"Kirby's Avalanche","file":"snes/Kirby's Avalanche (USA).zip","img":"","genre":"retro","emoji":"K","console":"snes","core":"snes"},
  {"title":"Kirby Super Star","file":"snes/Kirby Super Star (USA).zip","img":"","genre":"retro","emoji":"K","console":"snes","core":"snes"},
  {"title":"King of the Monsters 2","file":"snes/King of the Monsters 2 (USA).zip","img":"","genre":"retro","emoji":"K","console":"snes","core":"snes"},
  {"title":"King of the Monsters","file":"snes/King of the Monsters (USA).zip","img":"","genre":"retro","emoji":"K","console":"snes","core":"snes"},
  {"title":"King of Dragons","file":"snes/King of Dragons (USA).zip","img":"","genre":"retro","emoji":"K","console":"snes","core":"snes"},
  {"title":"King of Demons","file":"snes/King of Demons (Japan) [T-En by Aeon Genesis v1.01] [n].zip","img":"","genre":"retro","emoji":"K","console":"snes","core":"snes"},
  {"title":"King Arthur's World","file":"snes/King Arthur's World (USA).zip","img":"","genre":"retro","emoji":"K","console":"snes","core":"snes"},
  {"title":"Killer Instinct","file":"snes/Killer Instinct (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"K","console":"snes","core":"snes"},
  {"title":"Kid Klown in Crazy Chase","file":"snes/Kid Klown in Crazy Chase (USA).zip","img":"","genre":"retro","emoji":"K","console":"snes","core":"snes"},
  {"title":"Ken Griffey Jr.'s Winning Run","file":"snes/Ken Griffey Jr.'s Winning Run (USA).zip","img":"","genre":"retro","emoji":"K","console":"snes","core":"snes"},
  {"title":"Jurassic Park","file":"snes/Jurassic Park (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"J","console":"snes","core":"snes"},
  {"title":"Jungle Strike","file":"snes/Jungle Strike (USA).zip","img":"","genre":"retro","emoji":"J","console":"snes","core":"snes"},
  {"title":"Jungle Book, The","file":"snes/Jungle Book, The (USA).zip","img":"","genre":"retro","emoji":"J","console":"snes","core":"snes"},
  {"title":"Joe & Mac 2 - Lost in the Tropics","file":"snes/Joe & Mac 2 - Lost in the Tropics (USA).zip","img":"","genre":"retro","emoji":"J","console":"snes","core":"snes"},
  {"title":"Joe & Mac","file":"snes/Joe & Mac (USA).zip","img":"","genre":"retro","emoji":"J","console":"snes","core":"snes"},
  {"title":"Jim Lee's WildC.A.T.S - Covert-Action-Teams","file":"snes/Jim Lee's WildC.A.T.S - Covert-Action-Teams (USA).zip","img":"","genre":"retro","emoji":"J","console":"snes","core":"snes"},
  {"title":"Jikkyou Oshaberi Parodius","file":"snes/Jikkyou Oshaberi Parodius (Japan).zip","img":"","genre":"retro","emoji":"J","console":"snes","core":"snes"},
  {"title":"International Superstar Soccer Deluxe","file":"snes/International Superstar Soccer Deluxe (USA).zip","img":"","genre":"retro","emoji":"I","console":"snes","core":"snes"},
  {"title":"Inspector Gadget","file":"snes/Inspector Gadget (USA).zip","img":"","genre":"retro","emoji":"I","console":"snes","core":"snes"},
  {"title":"Inindo - Way of the Ninja","file":"snes/Inindo - Way of the Ninja (USA).zip","img":"","genre":"retro","emoji":"I","console":"snes","core":"snes"},
  {"title":"Indiana Jones' Greatest Adventures","file":"snes/Indiana Jones' Greatest Adventures (USA).zip","img":"","genre":"retro","emoji":"I","console":"snes","core":"snes"},
  {"title":"Illusion of Gaia","file":"snes/Illusion of Gaia (USA).zip","img":"","genre":"retro","emoji":"I","console":"snes","core":"snes"},
  {"title":"HyperZone","file":"snes/HyperZone (USA).zip","img":"","genre":"retro","emoji":"H","console":"snes","core":"snes"},
  {"title":"Humans, The","file":"snes/Humans, The (Europe).zip","img":"","genre":"retro","emoji":"H","console":"snes","core":"snes"},
  {"title":"Harvest Moon","file":"snes/Harvest Moon (USA).zip","img":"","genre":"retro","emoji":"H","console":"snes","core":"snes"},
  {"title":"Harley's Humongous Adventure","file":"snes/Harley's Humongous Adventure (USA).zip","img":"","genre":"retro","emoji":"H","console":"snes","core":"snes"},
  {"title":"Hammer Lock Wrestling","file":"snes/Hammer Lock Wrestling (USA).zip","img":"","genre":"retro","emoji":"H","console":"snes","core":"snes"},
  {"title":"Hagane - The Final Conflict","file":"snes/Hagane - The Final Conflict (USA).zip","img":"","genre":"retro","emoji":"H","console":"snes","core":"snes"},
  {"title":"Great Circus Mystery Starring Mickey & Minnie, The","file":"snes/Great Circus Mystery Starring Mickey & Minnie, The (USA).zip","img":"","genre":"retro","emoji":"G","console":"snes","core":"snes"},
  {"title":"Gradius III","file":"snes/Gradius III (USA).zip","img":"","genre":"retro","emoji":"G","console":"snes","core":"snes"},
  {"title":"Goof Troop","file":"snes/Goof Troop (USA).zip","img":"","genre":"retro","emoji":"G","console":"snes","core":"snes"},
  {"title":"Gokujou Parodius","file":"snes/Gokujou Parodius (Japan).zip","img":"","genre":"retro","emoji":"G","console":"snes","core":"snes"},
  {"title":"Go for it! Goemon 3 - The Mecha Leg Hold of Jurokube Shishi","file":"snes/Go for it! Goemon 3 - The Mecha Leg Hold of Jurokube Shishi (Japan) [T-En by DDSTranslation v4.0] [n].zip","img":"","genre":"retro","emoji":"G","console":"snes","core":"snes"},
  {"title":"Go for it! Goemon 2 - The Strange General McGuinness","file":"snes/Go for it! Goemon 2 - The Strange General McGuinness (Japan) [T-En by DDSTranslation v3.0] [n].zip","img":"","genre":"retro","emoji":"G","console":"snes","core":"snes"},
  {"title":"Go for it! Goemon - The Twinkling Journey - The Reason I became a Dancer","file":"snes/Go for it! Goemon - The Twinkling Journey - The Reason I became a Dancer (Japan) [T-En by DDSTranslation v3.0] [n].zip","img":"","genre":"retro","emoji":"G","console":"snes","core":"snes"},
  {"title":"Genghis Khan II - Clan of the Gray Wolf","file":"snes/Genghis Khan II - Clan of the Gray Wolf (USA).zip","img":"","genre":"retro","emoji":"G","console":"snes","core":"snes"},
  {"title":"Gemfire","file":"snes/Gemfire (USA).zip","img":"","genre":"retro","emoji":"G","console":"snes","core":"snes"},
  {"title":"Ganpuru - Gunman's Proof","file":"snes/Ganpuru - Gunman's Proof (Japan) [T-En by Aeon Genesis v1.03].zip","img":"","genre":"retro","emoji":"G","console":"snes","core":"snes"},
  {"title":"F-Zero","file":"snes/F-Zero (USA).zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Front Mission Series - Gun Hazard","file":"snes/Front Mission Series - Gun Hazard (Japan) [T-En by Aeon Genesis v1.01].zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Front Mission","file":"snes/Front Mission (Japan) [T-En by FH v1.0b].zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Flintstones, The - The Treasure of Sierra Madrock","file":"snes/Flintstones, The - The Treasure of Sierra Madrock (USA).zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Flashback - The Quest for Identity","file":"snes/Flashback - The Quest for Identity (USA) (En,Fr,De).zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"First Samurai","file":"snes/First Samurai (USA).zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"FireStriker","file":"snes/FireStriker (USA).zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Firepower 2000","file":"snes/Firepower 2000 (USA).zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Firemen, The","file":"snes/Firemen, The (Europe) (En,Fr,De).zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Fire Emblem - Thracia 776","file":"snes/Fire Emblem - Thracia 776 (Japan) [T-En by Cirosan v1.04] [Add by Miacis v1.08].zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Fire Emblem - Seisen no Keifu","file":"snes/Fire Emblem - Seisen no Keifu (Japan) [T-En by Dark Twilkitri Net v0.87g] [Add by Gharnef v1.0] [i].zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Fire Emblem - Mystery of the Emblem","file":"snes/Fire Emblem - Mystery of the Emblem (Japan) [T-En by RPGuy96 & VincentASM v0.98] [Add by Quirino v0.14] [Add by RobertTheSable v0.22] [n].zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Final Fantasy V","file":"snes/Final Fantasy V (Japan) [T-En by RPGe v1.10] [Add by Spooniest v2.1] [Legend of the Crystals].zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Final Fantasy III","file":"snes/Final Fantasy III (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Final Fantasy II","file":"snes/Final Fantasy II (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Final Fantasy - Mystic Quest","file":"snes/Final Fantasy - Mystic Quest (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Fatal Fury Special","file":"snes/Fatal Fury Special (USA).zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Fatal Fury 2","file":"snes/Fatal Fury 2 (USA).zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Fatal Fury","file":"snes/Fatal Fury (USA).zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Faceball 2000","file":"snes/Faceball 2000 (USA).zip","img":"","genre":"retro","emoji":"F","console":"snes","core":"snes"},
  {"title":"Earthworm Jim 2","file":"snes/Earthworm Jim 2 (USA).zip","img":"","genre":"retro","emoji":"E","console":"snes","core":"snes"},
  {"title":"Earthworm Jim","file":"snes/Earthworm Jim (USA).zip","img":"","genre":"retro","emoji":"E","console":"snes","core":"snes"},
  {"title":"EarthBound","file":"snes/EarthBound (USA).zip","img":"","genre":"retro","emoji":"E","console":"snes","core":"snes"},
  {"title":"E.V.O. - Search for Eden","file":"snes/E.V.O. - Search for Eden (USA).zip","img":"","genre":"retro","emoji":"E","console":"snes","core":"snes"},
  {"title":"Dragon View","file":"snes/Dragon View (USA).zip","img":"","genre":"retro","emoji":"D","console":"snes","core":"snes"},
  {"title":"Dragon Quest VI - Realms of Revelation","file":"snes/Dragon Quest VI - Realms of Revelation (Japan) [T-En by NoPrgress v0.90b2] [n].zip","img":"","genre":"retro","emoji":"D","console":"snes","core":"snes"},
  {"title":"Dragon Quest V - Tenkuu no Hanayome","file":"snes/Dragon Quest V - Tenkuu no Hanayome (Japan) [T-En by DeJap & Partial Translations v2.01].zip","img":"","genre":"retro","emoji":"D","console":"snes","core":"snes"},
  {"title":"Dragon Quest III - And into the Legend...","file":"snes/Dragon Quest III - And into the Legend... (Japan) [T-En by DQ Translations v1.1] [n].zip","img":"","genre":"retro","emoji":"D","console":"snes","core":"snes"},
  {"title":"Dragon Quest I & II","file":"snes/Dragon Quest I & II (Japan) [T-En by RPGOne v2.0 DQ] [Add by Mziab v1.0].zip","img":"","genre":"retro","emoji":"D","console":"snes","core":"snes"},
  {"title":"Dragon Ball Z - Super Saiya Densetsu","file":"snes/Dragon Ball Z - Super Saiya Densetsu (Japan) (Rev 1) [T-En by Klepto Software v1.02].zip","img":"","genre":"retro","emoji":"D","console":"snes","core":"snes"},
  {"title":"Dragon Ball Z - La Legende Saien","file":"snes/Dragon Ball Z - La Legende Saien (France).zip","img":"","genre":"retro","emoji":"D","console":"snes","core":"snes"},
  {"title":"Dragon Ball Z - Hyper Dimension","file":"snes/Dragon Ball Z - Hyper Dimension (Japan) [T-En by Twilight Translations v1.00].zip","img":"","genre":"retro","emoji":"D","console":"snes","core":"snes"},
  {"title":"Donkey Kong Country 3 - Dixie Kong's Double Trouble!","file":"snes/Donkey Kong Country 3 - Dixie Kong's Double Trouble! (USA) (En,Fr).zip","img":"","genre":"retro","emoji":"D","console":"snes","core":"snes"},
  {"title":"Donkey Kong Country 2 - Diddy's Kong Quest","file":"snes/Donkey Kong Country 2 - Diddy's Kong Quest (USA) (En,Fr) (Rev 1).zip","img":"","genre":"retro","emoji":"D","console":"snes","core":"snes"},
  {"title":"Donkey Kong Country","file":"snes/Donkey Kong Country (USA) (Rev 2).zip","img":"","genre":"retro","emoji":"D","console":"snes","core":"snes"},
  {"title":"Demon's Crest","file":"snes/Demon's Crest (USA).zip","img":"","genre":"retro","emoji":"D","console":"snes","core":"snes"},
  {"title":"Death and Return of Superman, The","file":"snes/Death and Return of Superman, The (USA) (Rev 1).zip","img":"","genre":"retro","emoji":"D","console":"snes","core":"snes"},
  {"title":"Daffy Duck - The Marvin Missions","file":"snes/Daffy Duck - The Marvin Missions (USA).zip","img":"","genre":"retro","emoji":"D","console":"snes","core":"snes"},
  {"title":"Cybernator","file":"snes/Cybernator (USA).zip","img":"","genre":"retro","emoji":"C","console":"snes","core":"snes"},
  {"title":"Cool Spot","file":"snes/Cool Spot (USA).zip","img":"","genre":"retro","emoji":"C","console":"snes","core":"snes"},
  {"title":"Contra III - The Alien Wars","file":"snes/Contra III - The Alien Wars (USA).zip","img":"","genre":"retro","emoji":"C","console":"snes","core":"snes"},
  {"title":"Clue","file":"snes/Clue (USA).zip","img":"","genre":"retro","emoji":"C","console":"snes","core":"snes"},
  {"title":"Clock Tower","file":"snes/Clock Tower (Japan) [T-En by Aeon Genesis v1.01].zip","img":"","genre":"retro","emoji":"C","console":"snes","core":"snes"},
  {"title":"Chuck Rock","file":"snes/Chuck Rock (USA).zip","img":"","genre":"retro","emoji":"C","console":"snes","core":"snes"},
  {"title":"Chrono Trigger","file":"snes/Chrono Trigger (USA).zip","img":"","genre":"retro","emoji":"C","console":"snes","core":"snes"},
  {"title":"Choplifter III - Rescue-Survive","file":"snes/Choplifter III - Rescue-Survive (USA).zip","img":"","genre":"retro","emoji":"C","console":"snes","core":"snes"},
  {"title":"Castlevania - Dracula X","file":"snes/Castlevania - Dracula X (USA).zip","img":"","genre":"retro","emoji":"C","console":"snes","core":"snes"},
  {"title":"Cannon Fodder","file":"snes/Cannon Fodder (Europe).zip","img":"","genre":"retro","emoji":"C","console":"snes","core":"snes"},
  {"title":"Cacoma Knight in Bizyland","file":"snes/Cacoma Knight in Bizyland (USA).zip","img":"","genre":"retro","emoji":"C","console":"snes","core":"snes"},
  {"title":"Bust-A-Move","file":"snes/Bust-A-Move (USA).zip","img":"","genre":"retro","emoji":"B","console":"snes","core":"snes"},
  {"title":"Bugs Bunny - Rabbit Rampage","file":"snes/Bugs Bunny - Rabbit Rampage (USA).zip","img":"","genre":"retro","emoji":"B","console":"snes","core":"snes"},
  {"title":"Breath of Fire II","file":"snes/Breath of Fire II (USA).zip","img":"","genre":"retro","emoji":"B","console":"snes","core":"snes"},
  {"title":"Breath of Fire","file":"snes/Breath of Fire (USA).zip","img":"","genre":"retro","emoji":"B","console":"snes","core":"snes"},
  {"title":"Brain Lord","file":"snes/Brain Lord (USA).zip","img":"","genre":"retro","emoji":"B","console":"snes","core":"snes"},
  {"title":"Boxing Legends of the Ring","file":"snes/Boxing Legends of the Ring (USA).zip","img":"","genre":"retro","emoji":"B","console":"snes","core":"snes"},
];
LEGACY_GAMES.forEach(g => g.console = g.console || 'segaMD');
let GAMES = [];

const CONSOLE_LABELS = {
  segaMD:'Mega Drive', segaMS:'Master System', segaGG:'Game Gear', nes:'NES',
  snes:'SNES', gb:'Game Boy', gbc:'Game Boy Color', gba:'GBA', n64:'N64', psx:'PS1',
  mupen64plus_next:'N64', 'parallel-n64':'N64', pcsx_rearmed:'PS1'
};
const EXT_TO_CORE = {
  md:'segaMD', gen:'segaMD', sms:'segaMS', gg:'segaGG', nes:'nes',
  sfc:'snes', smc:'snes', gb:'gb', gbc:'gb', gba:'gba',
  z64:'n64', n64:'n64', v64:'n64', chd:'psx'
};

// -----------------------------------------------------------------------------
// CATALOGUE AUTOMATIQUE
// -----------------------------------------------------------------------------
// Le site essaie d'abord games/games.json s'il existe.
// Sinon il lit automatiquement le dossier public GitHub "games/" et ses
// sous-dossiers. Ainsi, ajouter une ROM dans games/gba/, games/snes/, etc.
// suffit pour qu'elle apparaisse après le déploiement GitHub/Vercel.
//
// Dépôt actuellement utilisé par ce site :
const GITHUB_REPO = 'jimmymnt-prog/retrogaming';
const GITHUB_BRANCH = 'main';

const FOLDER_TO_CONSOLE = {
  '': 'segaMD',
  'megadrive': 'segaMD', 'genesis': 'segaMD', 'md': 'segaMD',
  'mastersystem': 'segaMS', 'master-system': 'segaMS', 'sms': 'segaMS',
  'gamegear': 'segaGG', 'game-gear': 'segaGG', 'gg': 'segaGG',
  'nes': 'nes',
  'snes': 'snes', 'supernintendo': 'snes', 'super-nintendo': 'snes',
  'gb': 'gb', 'gameboy': 'gb', 'game-boy': 'gb',
  'gbc': 'gbc', 'gameboycolor': 'gbc', 'game-boy-color': 'gbc',
  'gba': 'gba', 'gameboyadvance': 'gba', 'game-boy-advance': 'gba',
  'n64': 'n64', 'nintendo64': 'n64', 'nintendo-64': 'n64',
  'ps1': 'psx', 'psx': 'psx', 'playstation': 'psx', 'playstation1': 'psx'
};

const CONSOLE_TO_CORE = {
  segaMD:'segaMD', segaMS:'segaMS', segaGG:'segaGG',
  nes:'nes', snes:'snes', gb:'gb', gbc:'gb', gba:'gba',
  n64:'n64', psx:'psx'
};

const ROM_EXTENSIONS = new Set([
  'md','gen','bin','sms','gg','nes','sfc','smc','gb','gbc','gba',
  'z64','n64','v64','chd','zip','7z'
]);

function catalogueExtension(name){
  const clean=String(name||'').toLowerCase().split('?')[0];
  const i=clean.lastIndexOf('.');
  return i>=0 ? clean.slice(i+1) : '';
}

function prettyGameTitle(filename){
  return String(filename||'')
    .replace(/\.(zip|7z|md|gen|bin|sms|gg|nes|sfc|smc|gb|gbc|gba|z64|n64|v64|chd)$/i,'')
    .replace(/\s*\([^)]*\)/g,'')
    .replace(/\s*\[[^\]]*\]/g,'')
    .replace(/[_]+/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function inferConsole(folder, filename){
  const key=String(folder||'').toLowerCase().replace(/\s+/g,'');
  if(FOLDER_TO_CONSOLE[key]) return FOLDER_TO_CONSOLE[key];

  const ext=catalogueExtension(filename);
  if(ext==='nes') return 'nes';
  if(ext==='sfc'||ext==='smc') return 'snes';
  if(ext==='gb') return 'gb';
  if(ext==='gbc') return 'gbc';
  if(ext==='gba') return 'gba';
  if(ext==='z64'||ext==='n64'||ext==='v64') return 'n64';
  if(ext==='chd') return 'psx';
  if(ext==='sms') return 'segaMS';
  if(ext==='gg') return 'segaGG';
  if(ext==='md'||ext==='gen'||ext==='bin') return 'segaMD';
  return null;
}

function makeGameEntry(path, consoleName){
  const filename=path.split('/').pop();
  const title=prettyGameTitle(filename);
  const consoleId=consoleName || inferConsole(path.includes('/') ? path.split('/')[0] : '', filename);
  if(!consoleId) return null;
  return {
    title:title || filename,
    file:path,
    img:'',
    genre:'retro',
    emoji:(title||filename||'?').charAt(0).toUpperCase(),
    console:consoleId,
    core:CONSOLE_TO_CORE[consoleId] || consoleId
  };
}

async function loadJsonCatalogue(){
  try{
    const r=await fetch(new URL('games/games.json',window.location.href).href,{cache:'no-store'});
    if(!r.ok) return null;
    const data=await r.json();
    const arr=Array.isArray(data) ? data : data.games;
    if(!Array.isArray(arr)||!arr.length) return null;
    return arr.map(g=>({
      ...g,
      console:g.console||inferConsole((g.file||'').split('/')[0],g.file||''),
      core:g.core||CONSOLE_TO_CORE[g.console]||g.console
    })).filter(g=>g.file&&g.console);
  }catch(_){ return null; }
}

async function githubContents(path){
  const url='https://api.github.com/repos/'+GITHUB_REPO+'/contents/'+path+'?ref='+encodeURIComponent(GITHUB_BRANCH);
  const r=await fetch(url,{headers:{'Accept':'application/vnd.github+json'}});
  if(!r.ok) throw new Error('GitHub API '+r.status);
  return r.json();
}

async function loadGithubCatalogue(){
  const root=await githubContents('games');
  if(!Array.isArray(root)) throw new Error('Dossier games introuvable');

  const games=[];
  const folders=[];

  // ROMs directement dans /games = Mega Drive dans le projet actuel.
  for(const item of root){
    if(item.type==='file'){
      const ext=catalogueExtension(item.name);
      if(!ROM_EXTENSIONS.has(ext)) continue;
      const g=makeGameEntry(item.name,inferConsole('',item.name));
      if(g) games.push(g);
    }else if(item.type==='dir'){
      folders.push(item.name);
    }
  }

  // Chaque sous-dossier de /games est parcouru automatiquement.
  const results=await Promise.allSettled(folders.map(async folder=>{
    const items=await githubContents('games/'+encodeURIComponent(folder));
    return {folder,items};
  }));

  for(const result of results){
    if(result.status!=='fulfilled') continue;
    const {folder,items}=result.value;
    if(!Array.isArray(items)) continue;
    for(const item of items){
      if(item.type!=='file') continue;
      const ext=catalogueExtension(item.name);
      if(!ROM_EXTENSIONS.has(ext)) continue;
      const consoleId=inferConsole(folder,item.name);
      if(!consoleId) continue;
      const g=makeGameEntry(folder+'/'+item.name,consoleId);
      if(g) games.push(g);
    }
  }

  return games;
}

function addMissingConsoleButtons(){
  const bar=document.getElementById('consolebar');
  if(!bar) return;
  const local=document.getElementById('local-rom-btn');
  const existing=new Set([...bar.querySelectorAll('.console-btn')].map(b=>b.dataset.console));
  const order=['segaMD','segaMS','segaGG','nes','snes','gb','gbc','gba','n64','psx'];
  const available=new Set(GAMES.map(g=>g.console));

  for(const consoleId of order){
    if(!available.has(consoleId)||existing.has(consoleId)) continue;
    const b=document.createElement('button');
    b.className='console-btn';
    b.dataset.console=consoleId;
    b.textContent=CONSOLE_LABELS[consoleId]||consoleId;
    b.addEventListener('click',()=>{
      bar.querySelectorAll('.console-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      activeConsole=consoleId;
      renderLibrary();
    });
    bar.insertBefore(b,local||null);
  }
}

async function initCatalog(){
  let loaded=null;
  try{ loaded=await loadJsonCatalogue(); }catch(_){}

  if(!loaded || !loaded.length){
    try{ loaded=await loadGithubCatalogue(); }
    catch(err){ console.warn('Catalogue GitHub indisponible, fallback intégré utilisé.',err); }
  }

  GAMES=(loaded&&loaded.length) ? loaded : LEGACY_GAMES.slice();

  // Tri alphabétique à l'intérieur de la bibliothèque.
  GAMES.sort((a,b)=>(a.console||'').localeCompare(b.console||'') || a.title.localeCompare(b.title,'fr'));

  addMissingConsoleButtons();
  renderLibrary();

  console.info('[RetroGaming] Catalogue chargé :',GAMES.length,'jeux');
}


const library=document.getElementById('library'), searchEl=document.getElementById('h-search');
const emuOverlay=document.getElementById('emu-overlay'), emuFrame=document.getElementById('emu-frame');
const emuTitle=document.getElementById('emu-title'), emuBack=document.getElementById('emu-back');
const ldGameName=document.getElementById('ld-game-name'), ldStatus=document.getElementById('ld-status'), ldOverlay=document.getElementById('loading-overlay');
const ldProgressBar=document.getElementById('ld-progress-bar'), ldPercent=document.getElementById('ld-percent');
const modal=document.getElementById('rom-modal'), modalClose=document.getElementById('rom-modal-close');
const localBtn=document.getElementById('local-rom-btn'), fileInput=document.getElementById('rom-file');
const consoleSelect=document.getElementById('rom-console'), selection=document.getElementById('rom-selection');
const warning=document.getElementById('rom-warning'), launchBtn=document.getElementById('rom-launch'), dropZone=document.getElementById('drop-zone');

let activeGenre='all', activeConsole='all', searchQuery='', selectedFile=null;

function renderLibrary() {
  const q=searchQuery.toLowerCase();
  const filtered=GAMES.filter(g =>
    (activeGenre==='all'||g.genre===activeGenre) &&
    (activeConsole==='all'||g.console===activeConsole) &&
    (!q||g.title.toLowerCase().includes(q))
  );

  library.innerHTML='';

  if(!filtered.length){
    const e=document.createElement('div');
    e.className='empty-state';
    e.innerHTML='<p>Aucun jeu ne correspond</p>';
    library.appendChild(e);
    return;
  }

  const frag=document.createDocumentFragment();

  filtered.forEach(game=>{
    const row=document.createElement('button');
    row.type='button';
    row.className='game-list-row';

    const title=document.createElement('span');
    title.className='game-list-title';
    title.textContent=game.title;

    const con=document.createElement('span');
    con.className='game-list-console';
    con.textContent=CONSOLE_LABELS[game.console]||game.console;

    row.appendChild(title);
    row.appendChild(con);
    row.addEventListener('click',()=>launchBuiltIn(game));

    frag.appendChild(row);
  });

  library.appendChild(frag);
}

document.querySelectorAll('.genre-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.genre-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeGenre=btn.dataset.genre;renderLibrary();}));
document.querySelectorAll('.console-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.console-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeConsole=btn.dataset.console;renderLibrary();}));
searchEl.addEventListener('input',()=>{searchQuery=searchEl.value;renderLibrary();});

function setLoadProgress(value,status){
  const pct=Math.max(0,Math.min(100,Math.round(value)));
  if(ldProgressBar)ldProgressBar.style.width=pct+'%';
  if(ldPercent)ldPercent.textContent=pct+' %';
  if(status)ldStatus.textContent=status;
}
function showLoader(title,status='Préparation du jeu…'){emuOverlay.style.display='flex';emuFrame.style.display='none';ldOverlay.style.display='flex';ldGameName.textContent=title;ldStatus.textContent=status;emuTitle.textContent=title;setLoadProgress(0,status);}
function supportsWebGL2(){
  try{const c=document.createElement('canvas');return !!c.getContext('webgl2');}catch(_){return false;}
}
function threadsAvailable(){
  return !!(window.crossOriginIsolated && typeof SharedArrayBuffer !== 'undefined');
}
function performanceProfile(system){
  // Prefer the fastest practical cores. N64 uses Mupen on WebGL2 and falls back
  // to Parallel-N64 on older/limited browsers. PS1 uses PCSX-ReARMed.
  if(system==='psx' || system==='pcsx_rearmed'){
    return {core:'pcsx_rearmed', threads:threadsAvailable(), forceLegacy:false, label:'PS1 · PCSX-ReARMed'};
  }
  if(system==='n64' || system==='mupen64plus_next' || system==='parallel-n64'){
    const modern=supportsWebGL2();
    return {core:modern?'mupen64plus_next':'parallel-n64', threads:threadsAvailable(), forceLegacy:!modern, label:'N64 · '+(modern?'Mupen64Plus-Next':'Parallel-N64 (compatibilité)')};
  }
  // Lighter systems do not need threading overhead; use their fast defaults.
  return {core:system, threads:false, forceLegacy:false, label:CONSOLE_LABELS[system]||system};
}
function postLaunch(payload, title, system){
  const profile=performanceProfile(system);
  setLoadProgress(Math.max(parseInt(ldPercent?.textContent)||0,55),'Démarrage '+profile.label+(profile.threads?' · threads ON':'')+'…');
  emuFrame.addEventListener('load',()=>{
    setLoadProgress(62,'Initialisation de l’émulateur…');
    const message={type:'launch',core:profile.core,romName:payload.name,mimeType:'application/octet-stream',pathToData:EJS_CDN,useThreads:profile.threads,forceLegacy:profile.forceLegacy};
    if(payload.file){
      message.gameFile=payload.file;
      emuFrame.contentWindow.postMessage(message,'*');
    }else{
      message.romBuffer=payload.buffer;
      emuFrame.contentWindow.postMessage(message,'*',[payload.buffer]);
    }
  },{once:true});
  emuFrame.src=new URL('emulator.html',window.location.href).href+'?v=3.1';
}
function bootBuffer(buffer,name,system){postLaunch({buffer,name},name,system);}
function bootFile(file,system){postLaunch({file,name:file.name},file.name,system);}
async function launchBuiltIn(game){
  showLoader(game.title,'Téléchargement de la ROM…');
  try{
    const resp=await fetch(new URL('games/'+game.file,window.location.href).href);
    if(!resp.ok)throw new Error('ROM introuvable ('+resp.status+')');
    const total=Number(resp.headers.get('content-length'))||0;
    let buffer;
    if(resp.body&&resp.body.getReader){
      const reader=resp.body.getReader(), chunks=[];let loaded=0;
      while(true){
        const {done,value}=await reader.read();if(done)break;
        chunks.push(value);loaded+=value.byteLength;
        if(total)setLoadProgress((loaded/total)*50,'Téléchargement de la ROM…');
        else setLoadProgress(Math.min(48,5+loaded/1048576),'Téléchargement · '+(loaded/1048576).toFixed(1)+' Mo');
      }
      const merged=new Uint8Array(loaded);let off=0;
      for(const chunk of chunks){merged.set(chunk,off);off+=chunk.byteLength;}
      buffer=merged.buffer;
    }else{
      buffer=await resp.arrayBuffer();
    }
    setLoadProgress(52,'ROM chargée · préparation…');
    bootBuffer(buffer,game.file,game.core||game.console||BUILTIN_CORE);
  }
  catch(err){console.error(err);ldGameName.textContent='Impossible de charger le jeu';ldStatus.textContent=err.message;}
}

function extensionOf(name){const clean=name.toLowerCase().split('?')[0];const i=clean.lastIndexOf('.');return i>=0?clean.slice(i+1):'';}
function detectCore(file){const ext=extensionOf(file.name);if(EXT_TO_CORE[ext])return EXT_TO_CORE[ext];if(ext==='bin')return 'ambiguous-bin';if(ext==='zip'||ext==='7z')return 'archive';return null;}
function updateSelection(file){
  selectedFile=file||null;launchBtn.disabled=!selectedFile;
  if(!selectedFile){selection.textContent='Aucun fichier sélectionné';warning.textContent='';return;}
  selection.textContent=selectedFile.name+' · '+(selectedFile.size/1024/1024).toFixed(1)+' Mo';
  const d=detectCore(selectedFile), manual=consoleSelect.value;
  if(d==='ambiguous-bin'&&manual==='auto') warning.textContent='Le format .bin est ambigu (Mega Drive ou PS1). Choisissez manuellement la console.';
  else if(d==='archive'&&manual==='auto') warning.textContent='Pour un ZIP/7z, choisissez manuellement la console afin de lancer le bon cœur.';
  else if(!d&&manual==='auto') warning.textContent='Format non reconnu automatiquement : choisissez la console manuellement.';
  else warning.textContent='';
}
function openModal(){modal.classList.add('open');modal.setAttribute('aria-hidden','false');}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');}
localBtn.addEventListener('click',openModal);modalClose.addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});
fileInput.addEventListener('change',()=>updateSelection(fileInput.files[0]));consoleSelect.addEventListener('change',()=>selectedFile&&updateSelection(selectedFile));
['dragenter','dragover'].forEach(ev=>dropZone.addEventListener(ev,e=>{e.preventDefault();dropZone.classList.add('drag');}));
['dragleave','drop'].forEach(ev=>dropZone.addEventListener(ev,e=>{e.preventDefault();dropZone.classList.remove('drag');}));
dropZone.addEventListener('drop',e=>{const f=e.dataTransfer.files&&e.dataTransfer.files[0];if(f)updateSelection(f);});
launchBtn.addEventListener('click',async()=>{
  if(!selectedFile)return;let core=consoleSelect.value;const detected=detectCore(selectedFile);
  if(core==='auto'){if(!detected||detected==='ambiguous-bin'||detected==='archive'){warning.textContent='Sélectionnez la console avant de lancer ce fichier.';return;}core=detected;}
  closeModal();showLoader(selectedFile.name,'Préparation du fichier local…');
  setLoadProgress(50,'ROM locale prête · démarrage…');
  try{bootFile(selectedFile,core);}catch(err){ldGameName.textContent='Erreur de lecture';ldStatus.textContent=err.message;}
});


window.addEventListener('message',e=>{
  if(e.source!==emuFrame.contentWindow||!e.data||e.data.type!=='emu-progress')return;
  const p=Number(e.data.progress)||0;
  setLoadProgress(p,e.data.status||undefined);
  if(p>=100){
    setTimeout(()=>{ldOverlay.style.display='none';emuFrame.style.display='block';},180);
  }
});

emuBack.addEventListener('click',()=>{emuOverlay.style.display='none';emuFrame.style.display='none';emuFrame.src='about:blank';ldOverlay.style.display='flex';setLoadProgress(0,'Chargement');ldGameName.textContent='Chargement…';});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(modal.classList.contains('open'))closeModal();else if(emuOverlay.style.display==='flex')emuBack.click();}});
initCatalog();
