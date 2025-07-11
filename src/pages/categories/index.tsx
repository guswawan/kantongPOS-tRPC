import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import { CategoryCatalogCard } from "@/components/shared/category/CategoryCatalogCard";
import { CategoryForm } from "@/components/shared/category/CategoryForm";
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
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CATEGORIES } from "@/data/mock";
import { categoryFormSchema, type CategoryFormSchema } from "@/forms/category";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactElement } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { NextPageWithLayout } from "../_app";
import { api } from "@/utils/api";
import { type Category } from "@prisma/client";

type CategoryData = Pick<Category, "id" | "name" | "productCount">;

const CategoriesPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();
  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] =
    useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);

  const createCategoryForm = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
  });

  const editCategoryForm = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
  });

  const { data: categories, isLoading: categoriesIsLoading } =
    api.category.getCategories.useQuery();

  const { mutate: createCategory, isPending: isCreatingCategory } =
    api.category.createCategory.useMutation({
      onSuccess: async () => {
        await apiUtils.category.getCategories.invalidate();

        alert("Category created successfully");
        setCreateCategoryDialogOpen(false);
        createCategoryForm.reset();
      },
      onError: () => {
        alert("Category creation failed!");
      },
    });

  const { mutate: deleteCategoryById, isPending: isDeletingCategory } =
    api.category.deleteCategoryById.useMutation({
      onSuccess: async () => {
        await apiUtils.category.getCategories.invalidate();

        alert("Category deleted successfully");
        setCategoryToDelete(null);
      },
      onError: () => {
        alert("Category deletion failed!");
      },
    });

  const { mutate: editCategoryById, isPending: isEditingCategory } =
    api.category.editCategoryById.useMutation({
      onSuccess: async () => {
        await apiUtils.category.getCategories.invalidate();

        alert("Category edited successfully");
        setEditCategoryDialogOpen(false);
        setCategoryToEdit(null);
        editCategoryForm.reset();
      },
      onError: () => {
        alert("Category editing failed!");
      },
    });

  const handleSubmitCreateCategory = (data: CategoryFormSchema) => {
    createCategory({ name: data.name });
  };

  const handleSubmitEditCategory = (data: CategoryFormSchema) => {
    if (categoryToEdit) {
      editCategoryById({
        id: categoryToEdit,
        name: data.name,
      });
    }
  };

  const handleClickEditCategory = (category: CategoryData) => {
    setEditCategoryDialogOpen(true);
    setCategoryToEdit(category.id);

    editCategoryForm.reset({
      name: category.name,
    });
  };

  const handleClickDeleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId);
  };

  const handleConfirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategoryById({ id: categoryToDelete });
    }
  };

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Category Management</DashboardTitle>
            <DashboardDescription>
              Organize your products with custom categories.
            </DashboardDescription>
          </div>

          <AlertDialog
            open={createCategoryDialogOpen}
            onOpenChange={setCreateCategoryDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button>Add New Category</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create New Category</AlertDialogTitle>
              </AlertDialogHeader>
              <Form {...createCategoryForm}>
                <CategoryForm
                  onSubmit={handleSubmitCreateCategory}
                  submitText="Create Category"
                />
              </Form>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  onClick={createCategoryForm.handleSubmit(
                    handleSubmitCreateCategory,
                  )}
                >
                  Create Category
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div>
        {/* {CATEGORIES.length === 0 ? (
          <div className="rounded-md border">
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No categories found</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Get started by creating your first category
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.filter((cat) => cat.id !== "all").map((category) => (
              <CategoryCatalogCard
                key={category.id}
                name={category.name}
                productCount={category.count}
                onEdit={() => handleClickEditCategory(category)}
                onDelete={() => handleClickDeleteCategory(category.id)}
              />
            ))}
          </div>
        )} */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories?.map((category) => (
            <CategoryCatalogCard
              key={category.id}
              name={category.name}
              productCount={category.productCount}
              onEdit={() => handleClickEditCategory(category)}
              onDelete={() => handleClickDeleteCategory(category.id)}
            />
          ))}
        </div>
      </div>

      <AlertDialog
        open={editCategoryDialogOpen}
        onOpenChange={setEditCategoryDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Category</AlertDialogTitle>
          </AlertDialogHeader>
          <Form {...editCategoryForm}>
            <CategoryForm
              onSubmit={handleSubmitEditCategory}
              submitText="Edit Category"
            />
          </Form>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={editCategoryForm.handleSubmit(handleSubmitEditCategory)}
            >
              Edit Category
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this category? This action cannot be
            undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={handleConfirmDeleteCategory} variant="destructive">
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

CategoriesPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default CategoriesPage;
