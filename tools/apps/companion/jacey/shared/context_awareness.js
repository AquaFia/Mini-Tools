/* =========================================================
   SHARED COMPANION CONTEXT AWARENESS v1
   Phase 1 foundation only.
   - Uses the browser's local clock/date.
   - Accepts supplied birthday/event data.
   - Emits "companioncontextchange" when context changes.
   - Does not directly modify chat, portraits, themes, music,
     identity, episodes, or any other companion subsystem.
   ========================================================= */
(()=>{
  'use strict';

  const EVENT_NAME='companioncontextchange';

  function pad2(value){
    return String(value).padStart(2,'0');
  }

  function localDateKey(date=new Date()){
    return `${date.getFullYear()}-${pad2(date.getMonth()+1)}-${pad2(date.getDate())}`;
  }

  function monthDayKey(date=new Date()){
    return `${pad2(date.getMonth()+1)}-${pad2(date.getDate())}`;
  }

  function timeOfDay(hour){
    if(hour>=5 && hour<12)return 'morning';
    if(hour>=12 && hour<17)return 'afternoon';
    if(hour>=17 && hour<22)return 'evening';
    return 'night';
  }

  function seasonFor(month){
    if(month===12 || month<=2)return 'winter';
    if(month<=5)return 'spring';
    if(month<=8)return 'summer';
    return 'autumn';
  }

  function slug(value){
    return String(value??'')
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,'-')
      .replace(/^-+|-+$/g,'');
  }

  function normalizeDateValue(value){
    if(!value)return null;
    const text=String(value).trim();
    const match=text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if(!match)return null;
    return {
      dateKey:`${match[1]}-${match[2]}-${match[3]}`,
      monthDay:`${match[2]}-${match[3]}`
    };
  }

  function normalizeBirthday(item,index){
    if(!item || typeof item!=='object')return null;
    const date=normalizeDateValue(item.date||item.birthday);
    if(!date)return null;
    const character=String(item.character||item.name||'').trim();
    if(!character)return null;
    return {
      id:String(item.id||`birthday-${slug(character)||index}`),
      type:'birthday',
      character,
      date:date.dateKey,
      monthDay:date.monthDay,
      recurring:item.recurring!==false,
      visualContext:String(item.visualContext||'birthday').trim()||'birthday',
      metadata:item.metadata&&typeof item.metadata==='object'?item.metadata:{}
    };
  }

  function normalizeEvent(item,index){
    if(!item || typeof item!=='object')return null;
    const start=normalizeDateValue(item.date||item.startDate||item.start);
    if(!start)return null;
    const end=normalizeDateValue(item.endDate||item.end)||start;
    const name=String(item.name||item.title||'').trim();
    if(!name)return null;
    return {
      id:String(item.id||slug(name)||`event-${index}`),
      type:String(item.type||'event').trim().toLowerCase(),
      name,
      startDate:start.dateKey,
      endDate:end.dateKey,
      startMonthDay:start.monthDay,
      endMonthDay:end.monthDay,
      recurring:Boolean(item.recurring),
      visualContext:String(item.visualContext||slug(name)).trim(),
      metadata:item.metadata&&typeof item.metadata==='object'?item.metadata:{}
    };
  }

  function annualRangeContains(current,start,end){
    if(start<=end)return current>=start && current<=end;
    return current>=start || current<=end;
  }

  function eventIsActive(event,date){
    const today=localDateKey(date);
    const md=monthDayKey(date);
    if(event.recurring){
      return annualRangeContains(md,event.startMonthDay,event.endMonthDay);
    }
    return today>=event.startDate && today<=event.endDate;
  }

  function stableComparable(state){
    return JSON.stringify({
      date:state.date,
      weekday:state.weekday,
      timeOfDay:state.timeOfDay,
      month:state.month,
      season:state.season,
      birthdaysToday:state.birthdaysToday,
      eventsToday:state.eventsToday,
      visualContexts:state.visualContexts
    });
  }

  const CompanionContext={
    config:{companionId:null},
    data:{birthdays:[],events:[]},
    state:null,
    timer:null,

    initialize(config={}){
      if(config && typeof config==='object')this.config={...this.config,...config};
      this.refresh({force:true});
      if(!this.timer)this.timer=window.setInterval(()=>this.refresh(),60000);
      return this.get();
    },

    setEvents(payload={}){
      const birthdays=Array.isArray(payload.birthdays)?payload.birthdays:[];
      const events=Array.isArray(payload.events)?payload.events:[];
      this.data.birthdays=birthdays.map(normalizeBirthday).filter(Boolean);
      this.data.events=events.map(normalizeEvent).filter(Boolean);
      return this.refresh({force:true});
    },

    clearEvents(){
      this.data.birthdays=[];
      this.data.events=[];
      return this.refresh({force:true});
    },

    buildState(now=new Date()){
      const todayMonthDay=monthDayKey(now);
      const birthdaysToday=this.data.birthdays
        .filter(item=>item.monthDay===todayMonthDay)
        .map(item=>({...item}));

      const eventsToday=this.data.events
        .filter(item=>eventIsActive(item,now))
        .map(item=>({...item}));

      const visualContexts=[];
      for(const item of [...birthdaysToday,...eventsToday]){
        if(item.visualContext && !visualContexts.includes(item.visualContext)){
          visualContexts.push(item.visualContext);
        }
      }

      return Object.freeze({
        companionId:this.config.companionId||null,
        timestamp:now.toISOString(),
        timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||null,
        date:localDateKey(now),
        weekday:new Intl.DateTimeFormat(undefined,{weekday:'long'}).format(now),
        month:new Intl.DateTimeFormat(undefined,{month:'long'}).format(now),
        year:now.getFullYear(),
        hour:now.getHours(),
        timeOfDay:timeOfDay(now.getHours()),
        season:seasonFor(now.getMonth()+1),
        birthdaysToday:Object.freeze(birthdaysToday),
        eventsToday:Object.freeze(eventsToday),
        visualContexts:Object.freeze(visualContexts)
      });
    },

    refresh({force=false}={}){
      const next=this.buildState(new Date());
      const changed=force || !this.state || stableComparable(this.state)!==stableComparable(next);
      this.state=next;
      if(changed){
        window.dispatchEvent(new CustomEvent(EVENT_NAME,{detail:this.get()}));
      }
      return this.get();
    },

    get(){
      if(!this.state)return null;
      return {
        ...this.state,
        birthdaysToday:[...this.state.birthdaysToday],
        eventsToday:[...this.state.eventsToday],
        visualContexts:[...this.state.visualContexts]
      };
    },

    subscribe(listener){
      if(typeof listener!=='function')return ()=>{};
      const handler=event=>listener(event.detail);
      window.addEventListener(EVENT_NAME,handler);
      return ()=>window.removeEventListener(EVENT_NAME,handler);
    },

    destroy(){
      if(this.timer){
        clearInterval(this.timer);
        this.timer=null;
      }
    }
  };

  Object.defineProperty(window,'CompanionContext',{
    value:CompanionContext,
    configurable:false,
    enumerable:true,
    writable:false
  });
})();
