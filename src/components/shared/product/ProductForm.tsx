import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductFormSchema } from "@/forms/product";
import { Bucket } from "@/server/bucket";
import { uploadFileToSignedUrl } from "@/lib/supabase";
import { api } from "@/utils/api";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";

type ProductFormProps = {
  onSubmit: (values: ProductFormSchema) => void;
  onChangeImageUrl: (imageUrl: string) => void;
};

export const ProductForm = ({
  onSubmit,
  onChangeImageUrl,
}: ProductFormProps) => {
  const form = useFormContext<ProductFormSchema>();

  const { data: categories } = api.category.getCategories.useQuery();

  const { mutateAsync: createImageSignedUrl } =
    api.product.createProductImageUploadPresignedUrl.useMutation();

  const imageChangeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const { token, path } = await createImageSignedUrl();

    const imageUrl = await uploadFileToSignedUrl(
      Bucket.ProductImages,
      token,
      path,
      file,
    );

    onChangeImageUrl(imageUrl);
    alert("uploaded image");
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Price</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Category</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => {
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <Label>Product Image</Label>
        <Input
          onChange={imageChangeHandler}
          type="file"
          accept="image/*"
          className="cursor-pointer"
        />
      </div>
    </form>
  );
};
