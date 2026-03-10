import { db } from './firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export async function seedDatabase() {
  const storesSnap = await getDocs(collection(db, 'stores'));
  if (!storesSnap.empty) return; // Already seeded

  console.log("Seeding database...");

  // 1. Create Stores
  const stores = [
    {
      name: "Wap Store Centro",
      location: { lat: -23.5505, lng: -46.6333 },
      googlePlaceId: "ChIJ2eUgeZpZzpQR9XnSjG1f-Y8",
      rating: 4.8,
      isVerified: true,
      ownerUid: "system"
    },
    {
      name: "Eletro Tech Jardins",
      location: { lat: -23.5617, lng: -46.6623 },
      googlePlaceId: "ChIJ8-fSjG1f-Y8R9XnSjG1f-Y8",
      rating: 4.5,
      isVerified: false,
      ownerUid: "system"
    },
    {
      name: "Limpeza Total Pinheiros",
      location: { lat: -23.5667, lng: -46.6933 },
      googlePlaceId: "ChIJ8-fSjG1f-Y8R9XnSjG1f-Y8",
      rating: 4.2,
      isVerified: true,
      ownerUid: "system"
    }
  ];

  const storeIds: string[] = [];
  for (const s of stores) {
    const docRef = await addDoc(collection(db, 'stores'), s);
    storeIds.push(docRef.id);
  }

  // 2. Create Items
  const items = [
    { sku: "WAP-GTX", name: "Aspirador Wap GTX", category: "Limpeza", description: "Aspirador de pó e água profissional." },
    { sku: "PHILCO-PH10", name: "Aspirador Philco PH10", category: "Limpeza", description: "Aspirador vertical potente." },
    { sku: "ELEC-ERGO", name: "Electrolux Ergorapido", category: "Limpeza", description: "Aspirador sem fio 2 em 1." }
  ];

  for (const i of items) {
    await addDoc(collection(db, 'items'), i);
  }

  // 3. Create Inventory
  const inventory = [
    { storeId: storeIds[0], sku: "WAP-GTX", price: 899.90, lastUpdated: new Date().toISOString(), status: "Verificar estoque" },
    { storeId: storeIds[1], sku: "PHILCO-PH10", price: 450.00, lastUpdated: new Date().toISOString(), status: "Verificar estoque" },
    { storeId: storeIds[2], sku: "ELEC-ERGO", price: 1200.00, lastUpdated: new Date().toISOString(), status: "Verificar estoque" },
    { storeId: storeIds[0], sku: "PHILCO-PH10", price: 460.00, lastUpdated: new Date().toISOString(), status: "Verificar estoque" },
    { storeId: storeIds[1], sku: "WAP-GTX", price: 920.00, lastUpdated: new Date().toISOString(), status: "Verificar estoque" }
  ];

  for (const inv of inventory) {
    await addDoc(collection(db, 'inventory'), inv);
  }

  console.log("Database seeded successfully!");
}
