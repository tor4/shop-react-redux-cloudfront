import axios, { AxiosError } from "axios";
import React from "react";
import { useQuery, useQueryClient, useMutation } from "react-query";
import API_PATHS from "~/constants/apiPaths";
import { CartItem, CartItemEntity } from "~/models/CartItem";
import { AvailableProduct } from "~/models/Product";

export function useCart() {
  return useQuery<CartItem[], AxiosError>("cart", async () => {
    const res = await axios.get<CartItemEntity[]>(
      `${API_PATHS.cart}/api/profile/cart`,
      {
        headers: {
          Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
        },
      },
    );
    const productsRes = await Promise.all(
      res.data.map(({ productId }) =>
        axios.get<AvailableProduct>(`${API_PATHS.bff}/product/${productId}`),
      ),
    );

    const productsMap = new Map(productsRes.map((p) => [p.data.id, p.data]));
    return res.data.map((entity) => {
      const product = productsMap.get(entity.productId);
      return { product: product, count: entity.count } as CartItem;
    });
  });
}

export function useCartData() {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<CartItem[]>("cart");
}

export function useInvalidateCart() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("cart", { exact: true }),
    [],
  );
}

export function useUpsertCart() {
  return useMutation((values: CartItem) =>
    axios.put<CartItem[]>(`${API_PATHS.cart}/api/profile/cart`, values, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    }),
  );
}
