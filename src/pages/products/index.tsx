import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import type { NextPageWithLayout } from "../_app";
import { useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/data/mock";
import { ProductMenuCard } from "@/components/shared/product/ProductMenuCard";
import { ProductCatalogCard } from "@/components/shared/product/ProductCatalogCard";
import { api } from "@/utils/api";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Form } from "@/components/ui/form";
import { ProductForm } from "@/components/shared/product/ProductForm";
import { useForm } from "react-hook-form";
import { productFormSchema, type ProductFormSchema } from "@/forms/product";
import { zodResolver } from "@hookform/resolvers/zod";

const ProductsPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();

  const [uploadedCreateProductImageUrl, setUploadedCreateProductImageUrl] =
    useState<string | null>(null);
  console.log("uploadedCreateProductImageUrl", uploadedCreateProductImageUrl);
  const [createProductDialogOpen, setCreateProductDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const { data: products, isLoading: isLoadingProducts } =
    api.product.getProducts.useQuery();

  const { mutate: createProduct } = api.product.createProduct.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getProducts.invalidate();

      setCreateProductDialogOpen(false);
      alert("Product created");
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const { mutate: deleteProductById, isPending: isDeletingProduct } =
    api.product.deleteProductById.useMutation({
      onSuccess: async () => {
        await apiUtils.product.getProducts.invalidate();

        alert("Product deleted successfully");
        setProductToDelete(null);
      },
      onError: () => {
        alert("Product deletion failed!");
      },
    });

  const createProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });

  const handleSubmitCreateProduct = (values: ProductFormSchema) => {
    alert("SUBMIT");
    console.log("KLIKKKK", values, uploadedCreateProductImageUrl);
    if (!uploadedCreateProductImageUrl) {
      alert("Please upload an image");
      return;
    }

    createProduct({
      name: values.name,
      price: values.price,
      categoryId: values.categoryId,
      imageUrl: uploadedCreateProductImageUrl ?? null,
      // imageUrl: "https://placehold.co/600x400",
    });

    createProductForm.reset();
  };

  const handleClickDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
  };

  const handleConfirmDeleteProduct = () => {
    if (productToDelete) {
      deleteProductById({ id: productToDelete });
    }
  };

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Product Management</DashboardTitle>
            <DashboardDescription>
              View, add, edit, and delete products in your inventory.
            </DashboardDescription>
          </div>

          <AlertDialog
            open={createProductDialogOpen}
            onOpenChange={setCreateProductDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button>Add New Product</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create New Product</AlertDialogTitle>
              </AlertDialogHeader>

              <Form {...createProductForm}>
                <ProductForm
                  onSubmit={handleSubmitCreateProduct}
                  onChangeImageUrl={(imageUrl) =>
                    setUploadedCreateProductImageUrl(imageUrl)
                  }
                />
              </Form>

              <AlertDialogFooter className="mt-4">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  onClick={createProductForm.handleSubmit(
                    handleSubmitCreateProduct,
                  )}
                >
                  Create Product
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* {PRODUCTS.map((product) => (
          <ProductCatalogCard
            key={product.id}
            name={product.name}
            price={product.price}
            image={product.image ?? ""}
            category={product.category}
            onEdit={() => void 0}
            onDelete={() => void 0}
          />
        ))} */}

        {products?.map((product) => (
          <ProductCatalogCard
            key={product.id}
            name={product.name}
            price={product.price}
            image={product.imageUrl ?? ""}
            category={product.category.name}
            onEdit={() => void 0}
            onDelete={() => handleClickDeleteProduct(product.id)}
          />
        ))}
      </div>

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setProductToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={handleConfirmDeleteProduct} variant="destructive">
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

ProductsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProductsPage;
