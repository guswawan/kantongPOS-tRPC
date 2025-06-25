import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import { CategoryFilterCard } from "@/components/shared/category/CategoryFilterCard";
import { CreateOrderSheet } from "@/components/shared/CreateOrderSheet";
import { ProductMenuCard } from "@/components/shared/product/ProductMenuCard";
import { Input } from "@/components/ui/input";
import { CATEGORIES, PRODUCTS } from "@/data/mock";
import { Search, ShoppingBasket } from "lucide-react";
import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import type { NextPageWithLayout } from "../_app";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import { useBasketStore } from "@/store/basket";

const DashboardPage: NextPageWithLayout = () => {
  const basketStore = useBasketStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [orderSheetOpen, setOrderSheetOpen] = useState(false);

  const { data: products, isLoading: isLoadingProducts } =
    api.product.getProducts.useQuery();

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleAddToBasket = (productId: string) => {
    const productToAdd = products?.find((product) => product.id === productId);

    if (!productToAdd) {
      alert("Product not found!");
      return;
    }

    basketStore.addToBasket({
      productId: productToAdd.id,
      name: productToAdd.name,
      price: productToAdd.price,
      imageUrl: productToAdd.imageUrl ?? "",
    });
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const categoryMatch =
        selectedCategory === "all" || product.category === selectedCategory;

      const searchMatch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Dashboard</DashboardTitle>
            <DashboardDescription>
              Welcome to your Kantong POS system dashboard.
            </DashboardDescription>
          </div>

          {!!basketStore.items.length && (
            <Button
              className="animate-in slide-in-from-right"
              onClick={() => setOrderSheetOpen(true)}
            >
              <ShoppingBasket /> Basket
            </Button>
          )}
        </div>
      </DashboardHeader>

      <div className="space-y-6">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <CategoryFilterCard
              key={category.id}
              name={category.name}
              productCount={category.count}
              isSelected={selectedCategory === category.id}
              onClick={() => handleCategoryClick(category.id)}
            />
          ))}
        </div>

        <div>
          {products?.length === 0 ? (
            <div className="my-8 flex flex-col items-center justify-center">
              <p className="text-muted-foreground text-center">
                No products found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {/* {filteredProducts.map((product) => (
                <ProductMenuCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))} */}
              {products?.map((item) => (
                <ProductMenuCard
                  key={item.id}
                  productId={item.id}
                  name={item.name}
                  price={item.price}
                  imageUrl={item.imageUrl ?? "https://placehold.co/600x400"}
                  // product={item}
                  onAddToBasket={() => handleAddToBasket(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateOrderSheet
        open={orderSheetOpen}
        onOpenChange={setOrderSheetOpen}
      />
    </>
  );
};

DashboardPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardPage;
