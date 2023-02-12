var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class HauptbuchBooking {
  constructor(nr, date, account, km, liters, fuelPriceInEuro, amount, description, key, kmSinceLastEntry, kmSinceLastFuelFill, consumption, rowNr) {
    __publicField(this, "nr");
    __publicField(this, "date");
    __publicField(this, "account");
    __publicField(this, "km");
    __publicField(this, "kmSinceLastEntry");
    __publicField(this, "kmSinceLastFuelFill");
    __publicField(this, "liters");
    __publicField(this, "consumption");
    __publicField(this, "fuelPriceInEuro");
    __publicField(this, "amount");
    __publicField(this, "description");
    __publicField(this, "key");
    __publicField(this, "rowNr");
    this.nr = nr;
    this.date = date;
    this.account = account;
    this.km = km;
    this.kmSinceLastEntry = kmSinceLastEntry;
    this.kmSinceLastFuelFill = kmSinceLastFuelFill;
    this.liters = liters;
    this.consumption = consumption;
    this.fuelPriceInEuro = fuelPriceInEuro;
    this.amount = amount === "" ? "0" : amount;
    this.description = description;
    this.key = key;
    this.rowNr = rowNr || 0;
  }
}
class Booking {
  constructor(nr, date, soll, haben, description, kmStart) {
    __publicField(this, "nr");
    __publicField(this, "date");
    __publicField(this, "soll");
    __publicField(this, "haben");
    __publicField(this, "description");
    __publicField(this, "kmStart");
    this.nr = nr;
    this.date = date;
    this.soll = soll;
    this.haben = haben;
    this.description = description;
    this.kmStart = kmStart || 0;
  }
}
class Account {
  constructor(name, owner) {
    __publicField(this, "name");
    __publicField(this, "owner");
    __publicField(this, "bookings", []);
    this.name = name;
    this.owner = owner;
    this.bookings = [];
  }
  saldo() {
    return Math.round(
      100 * +this.bookings.reduce((acc, cv) => acc += +cv.haben - cv.soll, 0)
      //- this.soll.reduce((acc, cv) => acc += +cv.amount, 0) 
    ) / 100;
  }
  saldoY(year) {
    return Number(year) ? Math.round(
      100 * +this.bookings.filter((b) => b.date.substring(0, 4) === year.toString()).reduce((acc, cv) => acc += +cv.haben - cv.soll, 0)
    ) / 100 : this.saldo();
  }
  saldoSoll(year) {
    const filterFunc = Number(year) ? (b) => b.date.substring(0, 4) === year.toString() : (b) => true;
    return Math.round(100 * +this.bookings.filter((b) => filterFunc(b)).reduce((acc, cv) => acc += cv.soll, 0)) / 100;
  }
  saldoHaben(year) {
    const filterFunc = Number(year) ? (b) => b.date.substring(0, 4) === year.toString() : (b) => true;
    return Math.round(100 * +this.bookings.filter((b) => filterFunc(b)).reduce((acc, cv) => acc += cv.haben, 0)) / 100;
  }
}
class BussiAccountSystem {
  constructor(stakeholder = [], accounts = [], hauptbuchBookings = []) {
    __publicField(this, "accounts", []);
    __publicField(this, "hauptbuchBookings", []);
    __publicField(this, "Errors", {});
    __publicField(this, "Errors1", {});
    __publicField(this, "Reparaturkasse", {});
    this.hauptbuchBookings = hauptbuchBookings;
    this.Errors = new Account("Errors", "system");
    this.Errors1 = new Account("Errors1", "system");
    this.Reparaturkasse = new Account("Reparaturkasse", "Bussi");
    for (const owner of stakeholder)
      for (const name of accounts)
        this.accounts.push(new Account(name, owner));
  }
  findAccount(owner, name) {
    return this.accounts.find((a) => a.name === name && a.owner === owner) || this.Errors;
  }
  saldierenEuro(owner) {
    return Math.round(this.accounts.filter((a) => a.owner === owner).reduce((acc, cv) => cv.name !== "Kilometer" ? acc += cv.saldo() : acc, 0) * 100) / 100;
  }
}

export { BussiAccountSystem as B, HauptbuchBooking as H, Booking as a };
//# sourceMappingURL=types-50913745.mjs.map
