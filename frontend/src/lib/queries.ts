import { useQuery } from "@tanstack/react-query";
import { Category, Q, Transaction, gql } from "./api";

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: () => gql<{ categories: Category[] }>(Q.categories).then((d) => d.categories),
  });

export const useTransactions = () =>
  useQuery({
    queryKey: ["transactions"],
    queryFn: () => gql<{ transactions: Transaction[] }>(Q.transactions).then((d) => d.transactions),
  });
