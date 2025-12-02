import { defineStore } from "pinia";
import { ref } from "vue";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  onSnapshot,
  Unsubscribe
} from "firebase/firestore";
import { User } from "firebase/auth";
import db from "../firebase";


// Interfaces
export interface Ingredient {
  id: string;
  name: string;
  color: string;
}

export interface BeverageType {
  id?: string;
  name: string;
  base: Ingredient;
  creamer: Ingredient;
  syrup: Ingredient;
  temp: string;
  userId?: string;
}


// Store
export const useBeverageStore = defineStore("beverage", () => {

  const user = ref<User | null>(null);

  const bases = ref<Ingredient[]>([]);
  const creamers = ref<Ingredient[]>([]);
  const syrups = ref<Ingredient[]>([]);
  const beverages = ref<BeverageType[]>([]);

  const currentBeverage = ref<BeverageType | null>(null);

  const currentBase = ref<Ingredient | null>(null);
  const currentCreamer = ref<Ingredient | null>(null);
  const currentSyrup = ref<Ingredient | null>(null);

  const currentTemp = ref<string>("Hot");
  const currentBeverageName = ref<string>("");

  const temps = ref<string[]>(["Hot", "Cold"]);

  let unsubscribeBeverages: Unsubscribe | null = null;


  // Loads ingredients
  const loadIngredients = async () => {
    const basesSnapshot = await getDocs(collection(db, "bases"));
    bases.value = basesSnapshot.docs.map((doc) => doc.data() as Ingredient);

    const creamersSnapshot = await getDocs(collection(db, "creamers"));
    creamers.value = creamersSnapshot.docs.map((doc) => doc.data() as Ingredient);

    const syrupsSnapshot = await getDocs(collection(db, "syrups"));
    syrups.value = syrupsSnapshot.docs.map((doc) => doc.data() as Ingredient);

    if (bases.value.length > 0) currentBase.value = bases.value[0];
    if (creamers.value.length > 0) currentCreamer.value = creamers.value[0];
    if (syrups.value.length > 0) currentSyrup.value = syrups.value[0];
  };


  // Firestore for user beverages
  const setupBeverageListener = (userId: string) => {
    if (unsubscribeBeverages) unsubscribeBeverages();

    const q = query(
      collection(db, "beverages"),
      where("userId", "==", userId)
    );

    unsubscribeBeverages = onSnapshot(q, (snapshot) => {
      beverages.value = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data()
          } as BeverageType)
      );
    });
  };


  // User Authentication
  const setUser = (newUser: User | null) => {
    user.value = newUser;

    if (newUser) {
      setupBeverageListener(newUser.uid);
    } else {
      if (unsubscribeBeverages) unsubscribeBeverages();

      beverages.value = [];
      currentBeverage.value = null;
    }
  };


  // Creates new beverage
  const makeBeverage = async (): Promise<string> => {
    if (!user.value) {
      return "No user logged in, please sign in first.";
    }

    if (!currentBeverageName.value.trim()) {
      return "Please complete all beverage options and the name before making a beverage.";
    }

    if (!currentBase.value || !currentCreamer.value || !currentSyrup.value) {
      return "Please complete all beverage options and the name before making a beverage.";
    }

    const beverageName = currentBeverageName.value;
    currentBeverageName.value = "";

    try {
      const newBeverage: BeverageType = {
        name: beverageName,
        base: currentBase.value,
        creamer: currentCreamer.value,
        syrup: currentSyrup.value,
        temp: currentTemp.value,
        userId: user.value.uid
      };

      await addDoc(collection(db, "beverages"), newBeverage);
      return `Beverage ${beverageName} made successfully!`;
    } catch {
      return "Error saving beverage. Please try again.";
    }
  };


  // Displays existing beverage
  const showBeverage = (beverage: BeverageType) => {
    currentBase.value = beverage.base;
    currentCreamer.value = beverage.creamer;
    currentSyrup.value = beverage.syrup;
    currentTemp.value = beverage.temp;
    currentBeverage.value = beverage;
  };


  const init = async () => {
    await loadIngredients();
  };


  // Returns store API
  return {
    user,
    bases,
    creamers,
    syrups,
    beverages,

    currentBeverage,
    currentBase,
    currentCreamer,
    currentSyrup,
    currentTemp,
    currentBeverageName,

    temps,

    init,
    setUser,
    makeBeverage,
    showBeverage
  };
});
