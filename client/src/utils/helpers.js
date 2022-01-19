export function pluralize(name, count) {
  if (count === 1) {
    return name;
  }
  return name + "s";
}

//open connect to DB and connect to object store that we pass in as storeName, transation via method,
//and object values to carry it out
export function idbPromise(storeName, method, object) {
  return new Promise((resolve, reject) => {
    //open connection to the db `shop-shop` with the version of 1
    const request = window.indexedDB.open("shop-shop", 1);

    //create variables to hold reference to the database(db), transaction(tx), and object store
    let db, tx, store;

    //if version has changed (or if this is the first time using the database), run this method and create the three object stores
    request.onupgradeneeded = function (e) {
      const db = request.result;

      //create the object store for each type of data and set 'primary' key index to be the `_id` of the data
      db.createObjectStore("products", { keyPath: "_id" });
      db.createObjectStore("categories", { keyPath: "_id" });
      db.createObjectStore("cart", { keyPath: "_id" });
    };

    //handle any errors with connecting
    request.onerror = function (e) {
      console.log("There was an error");
    };

    //on db open success
    request.onsuccess = function (e) {
      //save a reference of the db to the `db` variable
      db = request.result;
      //open a transaction to whatever we pass into `storeName` (must match one of the object store names)
      tx = db.transaction(storeName, "readwrite");
      //save a reference to that object store
      store = tx.objectStore(storeName);

      //if theres any errors, let us know
      db.onerror = function (e) {
        console.log("error", e);
      };
      switch (method) {
        case "put":
          store.put(object);
          resolve(object);
          break;
        case "get":
          const all = store.getAll();
          all.onsuccess = function () {
            resolve(all.result);
          };
          break;
        case "delete":
          store.delete(object._id);
          break;
        default:
          console.log("No valid method");
          break;
      }
      //when the transaction is complete, close the connection
      tx.oncomplete = function () {
        db.close();
      };
    };
  });
}
