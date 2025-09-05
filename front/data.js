const categoryData = [
  { category:'신학과', depts:[{ name:'신학과', majors:['신학과'] }] },
  { category:'사회과학부', depts:[{ name:'사회과학부', majors:['미디어영상광고학과','경영학과','관광경영학과'] }] },
  { category:'공공서비스학부', depts:[{ name:'공공서비스학부', majors:['경찰행정학과','사회복지학과'] }] },
  { category:'언어학부', depts:[{ name:'언어학부', majors:['영어학과','중국어학과'] }] },
  { category:'IT학부', depts:[{ name:'IT학부', majors:['컴퓨터공학과','융합보안학과','IT학부'] }] },
  { category:'간호학과', depts:[{ name:'간호학과', majors:['간호학과'] }] },
  { category:'디자인학부', depts:[{ name:'디자인학부', majors:['시각정보디자인학과','실내건축디자인학과','섬유패션디자인학과'] }] },
  { category:'예술학부', depts:[{ name:'예술학부', majors:['음악학과','공연예술학과'] }] },
  { category:'자유전공학부', depts:[{ name:'자유전공학부', majors:['자유전공학부'] }] }
];
const subjects = [
  { dept:'신학과', major:'신학과', year:1, name:'신약입문', code:'15866', type:'전공기초', credit:3, cap:30, prof:'정미배' },
  { dept:'신학과', major:'신학과', year:1, name:'모세오경', code:'10582', type:'전공필수', credit:3, cap:30, prof:'안정해' },
  
  { dept:'IT학부', major:'IT학부', year:1, name:'IT학부세미나', code:'25103', type:'전공필수', credit:3, cap:30, prof:'공삼공' },
  { dept:'IT학부', major:'IT학부', year:1, name:'프로그래밍 기초', code:'25133', type:'전공기초', credit:3, cap:30, prof:'김집선' },
  { dept:'IT학부', major:'컴퓨터공학과', year:1, name:'웹프로그래밍', code:'19504', type:'전공필수', credit:3, cap:30, prof:'홍길동' },
  { dept:'IT학부', major:'컴퓨터공학과', year:1, name:'자료구조', code:'19505', type:'전공필수', credit:3, cap:30, prof:'이몽룡' },
  { dept:'IT학부', major:'융합보안학과', year:1, name:'정보보안개론', code:'19509', type:'전공기초', credit:3, cap:30, prof:'김보안' },
  
  { dept:'사회과학부', major:'미디어영상광고학과', year:1, name:'광고학개론', code:'21001', type:'전공기초', credit:3, cap:30, prof:'박광고' },
  { dept:'사회과학부', major:'경영학과', year:1, name:'경영학원론', code:'21002', type:'전공기초', credit:3, cap:30, prof:'최경영' },
  
  { dept:'공공서비스학부', major:'경찰행정학과', year:1, name:'경찰학개론 1', code:'22001', type:'전공기초', credit:3, cap:30, prof:'이경찰' },
  { dept:'공공서비스학부', major:'경찰행정학과', year:1, name:'경찰실습', code:'22021', type:'전공필수', credit:3, cap:30, prof:'이법찰' },
  { dept:'공공서비스학부', major:'사회복지학과', year:1, name:'사회복지학개론 +', code:'24221', type:'전공기초', credit:3, cap:30, prof:'장사법' },
  { dept:'공공서비스학부', major:'사회복지학과', year:1, name:'사회봉사와진로탐색', code:'23421', type:'전공필수', credit:3, cap:30, prof:'사복진' },
  
  { dept:'언어학부', major:'영어학과', year:1, name:'통번역입문', code:'12301', type:'전공기초', credit:3, cap:30, prof:'박웨이' },
  { dept:'언어학부', major:'영어학과', year:1, name:'Grammer for Writing 1', code:'23982', type:'전공필수', credit:3, cap:30, prof:'제이미' },
  { dept:'언어학부', major:'중국어학과', year:1, name:'왕초보 중국어', code:'24212', type:'전공필수', credit:3, cap:30, prof:'이궈른' },
  { dept:'언어학부', major:'중국어학과', year:1, name:'기초 중국어 회화1', code:'24312', type:'전공필수', credit:3, cap:30, prof:'이얼싼' },
  
  { dept:'디자인학부', major:'시각정보디자인학과', year:1, name:'전공탐색세미나', code:'24001', type:'전공필수', credit:3, cap:30, prof:'곽시각' },
  { dept:'디자인학부', major:'시각정보디자인학과', year:1, name:'컴퓨터그래픽', code:'24250', type:'전공기초', credit:3, cap:30, prof:'김디자인' },
  { dept:'디자인학부', major:'실내건축디자인학과', year:1, name:'컴퓨터그래픽', code:'24250', type:'전공기초', credit:3, cap:30, prof:'김디자인' },
  { dept:'디자인학부', major:'실내건축디자인학과', year:1, name:'전공탐색세미나', code:'24267', type:'전공필수', credit:3, cap:30, prof:'전탐색' },
  { dept:'디자인학부', major:'섬유패션디자인학과', year:1, name:'전공탐색세미나', code:'24267', type:'전공필수', credit:3, cap:30, prof:'전탐색' },
  { dept:'디자인학부', major:'섬유패션디자인학과', year:1, name:'컴퓨터그래픽', code:'24250', type:'전공기초', credit:3, cap:30, prof:'김디자인' },

];
