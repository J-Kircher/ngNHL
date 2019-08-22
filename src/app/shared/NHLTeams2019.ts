import { ITeam } from '../model/nhl.model';

export const _TEAMS: ITeam[] = [
  { 'city': 'Carolina',     'name': 'Hurricanes',     'abbrev': 'CAR', 'lightcolor': 'FF0008', 'darkcolor': '181818', 'division': 'East Metro',    'of': 6, 'de': 7, 'pp': 6, 'pk': 5, 'go': 6, 'co': 7 },
  { 'city': 'Columbus',     'name': 'Blue Jackets',   'abbrev': 'CLB', 'lightcolor': 'DE3942', 'darkcolor': '00295A', 'division': 'East Metro',    'of': 6, 'de': 9, 'pp': 5, 'pk': 8, 'go': 9, 'co': 7 },
  { 'city': 'New Jersey',   'name': 'Devils',         'abbrev': 'NJ',  'lightcolor': 'DE2931', 'darkcolor': '000000', 'division': 'East Metro',    'of': 8, 'de': 8, 'pp': 8, 'pk': 7, 'go': 7, 'co': 7 },
  { 'city': 'New York',     'name': 'Islanders',      'abbrev': 'NYI', 'lightcolor': 'FF8C42', 'darkcolor': '00005A', 'division': 'East Metro',    'of': 8, 'de': 8, 'pp': 9, 'pk': 8, 'go': 8, 'co': 7 },
  { 'city': 'New York',     'name': 'Rangers',        'abbrev': 'NYR', 'lightcolor': 'CE0021', 'darkcolor': '00639C', 'division': 'East Metro',    'of': 7, 'de': 8, 'pp': 8, 'pk': 7, 'go': 8, 'co': 7 },
  { 'city': 'Philadelphia', 'name': 'Flyers',         'abbrev': 'PHI', 'lightcolor': 'FF8410', 'darkcolor': '000000', 'division': 'East Metro',    'of': 7, 'de': 7, 'pp': 7, 'pk': 6, 'go': 7, 'co': 7 },
  { 'city': 'Pittsburgh',   'name': 'Penguins',       'abbrev': 'PIT', 'lightcolor': 'FBB600', 'darkcolor': '000000', 'division': 'East Metro',    'of': 8, 'de': 5, 'pp': 9, 'pk': 7, 'go': 6, 'co': 7 },
  { 'city': 'Washington',   'name': 'Capitals',       'abbrev': 'WAS', 'lightcolor': 'CD0028', 'darkcolor': '001C43', 'division': 'East Metro',    'of': 7, 'de': 7, 'pp': 8, 'pk': 7, 'go': 7, 'co': 7 },
  { 'city': 'Boston',       'name': 'Bruins',         'abbrev': 'BOS', 'lightcolor': 'FFDE29', 'darkcolor': '000000', 'division': 'East Atlantic', 'of': 6, 'de': 8, 'pp': 7, 'pk': 8, 'go': 7, 'co': 7 },
  { 'city': 'Buffalo',      'name': 'Sabres',         'abbrev': 'BUF', 'lightcolor': 'FFBD31', 'darkcolor': '002963', 'division': 'East Atlantic', 'of': 5, 'de': 6, 'pp': 5, 'pk': 7, 'go': 5, 'co': 7 },
  { 'city': 'Detroit',      'name': 'Red Wings',      'abbrev': 'DET', 'lightcolor': 'FFFFFF', 'darkcolor': 'DE2121', 'division': 'East Atlantic', 'of': 6, 'de': 6, 'pp': 8, 'pk': 7, 'go': 6, 'co': 7 },
  { 'city': 'Florida',      'name': 'Panthers',       'abbrev': 'FLA', 'lightcolor': 'BC9660', 'darkcolor': 'CE002E', 'division': 'East Atlantic', 'of': 7, 'de': 6, 'pp': 7, 'pk': 6, 'go': 6, 'co': 7 },
  { 'city': 'Montreal',     'name': 'Canadiens',      'abbrev': 'MON', 'lightcolor': 'CE2121', 'darkcolor': '00315A', 'division': 'East Atlantic', 'of': 7, 'de': 6, 'pp': 7, 'pk': 6, 'go': 6, 'co': 7 },
  { 'city': 'Ottawa',       'name': 'Senators',       'abbrev': 'OTT', 'lightcolor': 'DE8C00', 'darkcolor': 'DE2129', 'division': 'East Atlantic', 'of': 6, 'de': 6, 'pp': 7, 'pk': 6, 'go': 5, 'co': 7 },
  { 'city': 'Tampa Bay',    'name': 'Lightning',      'abbrev': 'TB',  'lightcolor': 'FFFFFF', 'darkcolor': '04236C', 'division': 'East Atlantic', 'of': 9, 'de': 9, 'pp': 9, 'pk': 8, 'go': 9, 'co': 7 },
  { 'city': 'Toronto',      'name': 'Maple Leafs',    'abbrev': 'TOR', 'lightcolor': 'FFFFFF', 'darkcolor': '002462', 'division': 'East Atlantic', 'of': 9, 'de': 7, 'pp': 8, 'pk': 7, 'go': 8, 'co': 7 },
  { 'city': 'Chicago',      'name': 'Blackhawks',     'abbrev': 'CHI', 'lightcolor': 'FF0018', 'darkcolor': '000000', 'division': 'West Central',  'of': 7, 'de': 8, 'pp': 6, 'pk': 8, 'go': 8, 'co': 7 },
  { 'city': 'Colorado',     'name': 'Avalanche',      'abbrev': 'COL', 'lightcolor': 'ADAEF7', 'darkcolor': '730021', 'division': 'West Central',  'of': 7, 'de': 6, 'pp': 7, 'pk': 7, 'go': 5, 'co': 7 },
  { 'city': 'Dallas',       'name': 'Stars',          'abbrev': 'DAL', 'lightcolor': 'A5AAAD', 'darkcolor': '0F714A', 'division': 'West Central',  'of': 7, 'de': 7, 'pp': 7, 'pk': 8, 'go': 7, 'co': 7 },
  { 'city': 'Minnesota',    'name': 'Wild',           'abbrev': 'MIN', 'lightcolor': 'FFDE08', 'darkcolor': '085239', 'division': 'West Central',  'of': 6, 'de': 7, 'pp': 8, 'pk': 8, 'go': 7, 'co': 7 },
  { 'city': 'Nashville',    'name': 'Predators',      'abbrev': 'NAS', 'lightcolor': 'FDB801', 'darkcolor': '001D43', 'division': 'West Central',  'of': 9, 'de': 6, 'pp': 7, 'pk': 5, 'go': 5, 'co': 7 },
  { 'city': 'St. Louis',    'name': 'Blues',          'abbrev': 'STL', 'lightcolor': 'FFE700', 'darkcolor': '004273', 'division': 'West Central',  'of': 8, 'de': 8, 'pp': 7, 'pk': 6, 'go': 8, 'co': 7 },
  { 'city': 'Winnipeg',     'name': 'Jets',           'abbrev': 'WPG', 'lightcolor': 'C41234', 'darkcolor': '042E64', 'division': 'West Central',  'of': 9, 'de': 7, 'pp': 9, 'pk': 7, 'go': 8, 'co': 7 },
  { 'city': 'Anaheim',      'name': 'Ducks',          'abbrev': 'ANA', 'lightcolor': 'B59463', 'darkcolor': '212121', 'division': 'West Pacific',  'of': 6, 'de': 7, 'pp': 7, 'pk': 8, 'go': 9, 'co': 7 },
  { 'city': 'Arizona',      'name': 'Coyotes',        'abbrev': 'ARI', 'lightcolor': 'FFD6AD', 'darkcolor': '840021', 'division': 'West Pacific',  'of': 6, 'de': 5, 'pp': 7, 'pk': 7, 'go': 5, 'co': 7 },
  { 'city': 'Calgary',      'name': 'Flames',         'abbrev': 'CGY', 'lightcolor': 'FFEF39', 'darkcolor': 'DE1018', 'division': 'West Pacific',  'of': 7, 'de': 6, 'pp': 7, 'pk': 6, 'go': 6, 'co': 7 },
  { 'city': 'Edmonton',     'name': 'Oilers',         'abbrev': 'EDM', 'lightcolor': 'BD8442', 'darkcolor': '00295A', 'division': 'West Pacific',  'of': 6, 'de': 6, 'pp': 6, 'pk': 5, 'go': 5, 'co': 7 },
  { 'city': 'Los Angeles',  'name': 'Kings',          'abbrev': 'LA',  'lightcolor': '94928C', 'darkcolor': '040204', 'division': 'West Pacific',  'of': 8, 'de': 9, 'pp': 7, 'pk': 9, 'go': 9, 'co': 7 },
  { 'city': 'San Jose',     'name': 'Sharks',         'abbrev': 'SJ',  'lightcolor': '007BA5', 'darkcolor': '000000', 'division': 'West Pacific',  'of': 5, 'de': 9, 'pp': 7, 'pk': 9, 'go': 9, 'co': 7 },
  { 'city': 'Vancouver',    'name': 'Canucks',        'abbrev': 'VAN', 'lightcolor': 'ADAEF7', 'darkcolor': '00205E', 'division': 'West Pacific',  'of': 6, 'de': 8, 'pp': 8, 'pk': 7, 'go': 8, 'co': 7 },
  { 'city': 'Vegas',        'name': 'Golden Knights', 'abbrev': 'LV',  'lightcolor': '8E7349', 'darkcolor': '344248', 'division': 'West Pacific',  'of': 8, 'de': 7, 'pp': 7, 'pk': 6, 'go': 6, 'co': 7 }
];

// Created on Thu Aug 15, 2019
// end of NHLTeams2019
