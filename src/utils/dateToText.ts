const months = ["January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
]

export function getMonthName(nr :number) {
  return months[nr];
}

export function ordinal(nr :number) {
  let ord = 'th';

  if (nr % 10 === 1 && nr % 100 !== 11)
  {
    ord = 'st';
  }
  else if (nr % 10 === 2 && nr % 100 !== 12)
  {
    ord = 'nd';
  }
  else if (nr % 10 === 3 && nr % 100 !== 13)
  {
    ord = 'rd';
  }

  return `${nr}${ord}`;
}

export function dateToText(date :string) {
  if (!date) return "Unknown"
  // year month day
  // 0    1     2
  const datearr = date.split("-");
  return `${getMonthName( parseInt(datearr[1])-1)} ${ordinal(parseInt(datearr[2]))}, ${datearr[0]}`
}

export function isTime1Ibetween(time1 :{hour:number, minute:number}, time2 :{opening_hour:number, opening_minute:number, closing_hour:number, closing_minute:number} ) :boolean {

    // @ts-ignore
    if (parseInt(time2["opening_hour"]) > parseInt(time2["closing_hour"])){

            // @ts-ignore
            if (parseInt(time1["hour"]) === parseInt(time2["opening_hour"])){
                // @ts-ignore
                return parseInt(time1["minute"]) < parseInt(time2["opening_minute"])
            }

            // @ts-ignore
            if (parseInt(time1["hour"]) === parseInt(time2["closing_hour"])){
                // @ts-ignore
                return parseInt(time1["minute"]) > parseInt(time2["closing_minute"])
            }

        // @ts-ignore
        return parseInt(time1["hour"]) < parseInt(time2["opening_hour"]) && parseInt(time1["hour"]) > parseInt(time2["closing_hour"])
    }

    // @ts-ignore
    if (parseInt(time1["hour"]) === parseInt(time2["opening_hour"])){
        // @ts-ignore
        return parseInt(time1["minute"]) >= parseInt(time2["opening_minute"])
    }

    // @ts-ignore
    if (parseInt(time1["hour"]) === parseInt(time2["closing_hour"])){
        // @ts-ignore
        return parseInt(time1["minute"]) <= parseInt(time2["closing_minute"])
    }

    // @ts-ignore
    return parseInt(time1["hour"]) > parseInt(time2["opening_hour"]) && parseInt(time1["hour"]) < parseInt(time2["closing_hour"])
  }