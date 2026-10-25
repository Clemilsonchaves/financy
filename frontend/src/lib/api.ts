const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/";
const TOKEN_KEY = "financy:token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token = getToken();
  const res = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    const err = json.errors[0];
    if (err.extensions?.code === "UNAUTHENTICATED" && token) {
      clearToken();
      window.dispatchEvent(new Event("financy:logout"));
    }
    throw new Error(err.message);
  }
  return json.data as T;
}

export type User = { id: string; name: string; email: string };
export type Category = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
};
export type TxType = "INCOME" | "EXPENSE";
export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: TxType;
  date: string;
  category: Category | null;
};

const CATEGORY_FIELDS = `id name description icon color`;
const TX_FIELDS = `id description amount type date category { ${CATEGORY_FIELDS} }`;

export const Q = {
  me: `query { me { id name email } }`,
  updateProfile: `mutation($name:String!){ updateProfile(name:$name){ id name email } }`,
  login: `mutation($email:String!,$password:String!){ login(email:$email,password:$password){ token user{ id name email } } }`,
  register: `mutation($name:String!,$email:String!,$password:String!){ register(name:$name,email:$email,password:$password){ token user{ id name email } } }`,
  categories: `query { categories { ${CATEGORY_FIELDS} } }`,
  createCategory: `mutation($name:String!,$description:String,$icon:String,$color:String){ createCategory(name:$name,description:$description,icon:$icon,color:$color){ id } }`,
  updateCategory: `mutation($id:ID!,$name:String,$description:String,$icon:String,$color:String){ updateCategory(id:$id,name:$name,description:$description,icon:$icon,color:$color){ id } }`,
  deleteCategory: `mutation($id:ID!){ deleteCategory(id:$id) }`,
  transactions: `query { transactions { ${TX_FIELDS} } }`,
  createTransaction: `mutation($description:String!,$amount:Float!,$type:TransactionType!,$date:DateTime,$categoryId:ID){ createTransaction(description:$description,amount:$amount,type:$type,date:$date,categoryId:$categoryId){ id } }`,
  updateTransaction: `mutation($id:ID!,$description:String,$amount:Float,$type:TransactionType,$date:DateTime,$categoryId:ID){ updateTransaction(id:$id,description:$description,amount:$amount,type:$type,date:$date,categoryId:$categoryId){ id } }`,
  deleteTransaction: `mutation($id:ID!){ deleteTransaction(id:$id) }`,
};

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
