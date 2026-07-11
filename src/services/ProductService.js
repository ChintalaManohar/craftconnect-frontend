import API from "./api";

export const productService = {
    getAllProducts: async () => {
        const response = await API.get("/products/getallproducts");
        return response.data;
    },

    getProductById: async (id) => {
        const response = await API.get(`/products/${id}`);
        return response.data;
    },

    searchProducts: async (keyword) => {
        const response = await API.get(`/products/search?keyword=${keyword}`);
        return response.data;
    },
};