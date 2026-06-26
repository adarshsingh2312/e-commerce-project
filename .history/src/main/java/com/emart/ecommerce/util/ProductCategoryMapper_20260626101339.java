package com.emart.ecommerce.util;

import java.util.Locale;

import com.emart.ecommerce.model.Category;
import com.emart.ecommerce.model.Product;

public final class ProductCategoryMapper {
    public static final String MEN = "MEN";
    public static final String WOMEN = "WOMEN";
    public static final String TOP_WEAR = "Top Wear";
    public static final String BOTTOM_WEAR = "Bottom Wear";
    public static final String FOOTWEAR = "Footwear";
    public static final String ETHNIC_WEAR = "Ethnic Wear";
    public static final String WINTER_WEAR = "Winter Wear";
    public static final String ACCESSORIES = "Accessories";

    private ProductCategoryMapper() {
    }

    public static void applyNormalizedFields(Product product) {
        if (product == null) {
            return;
        }
        
        Category leafCategory = product.getCategory();
        Category parentCategory = leafCategory != null ? leafCategory.getParentCategory() : null;
        Category topCategory = parentCategory != null ? parentCategory.getParentCategory() : null;

        String topName = topCategory != null ? topCategory.getName() : null;
        String parentName = parentCategory != null ? parentCategory.getName() : null;
        String leafName = leafCategory != null ? leafCategory.getName() : null;

        product.setGender(normalizeGender(firstPresent(product.getGender(), topName)));
        product.setProductCategory(normalizeProductCategory(resolveProductCategory(product.getProductCategory(), parentName, leafName)));
        product.setSubCategory(normalizeSubCategory(firstPresent(product.getSubCategory(), leafName)));
    }

    public static String normalizeGender(String value) {
        if (isBlank(value)) {
            return "";
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT);
        if (normalized.equals("MALE") || normalized.equals("MAN") || normalized.equals("MEN")) {
            return MEN;
        }
        if (normalized.equals("FEMALE") || normalized.equals("WOMAN") || normalized.equals("WOMEN")) {
            return WOMEN;
        }
        return normalized;
    }

    public static String normalizeProductCategory(String value) {
        if (isBlank(value)) {
            return "";
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "shirt", "top", "dress", "tops", "top wear" -> TOP_WEAR;
            case "jeans", "pants", "trouser", "trousers", "bottom wear" -> BOTTOM_WEAR;
            case "shoes", "shoe", "footwear" -> FOOTWEAR;
            case "kurta", "saree", "gown", "gouns", "lehenga choli", "lengha choli", "ethnic wear" -> ETHNIC_WEAR;
            case "winter wear" -> WINTER_WEAR;
            case "accessories", "accessory" -> ACCESSORIES;
            default -> value.trim();
        };
    }

    public static boolean isShopperCategory(String value) {
        if (isBlank(value)) {
            return false;
        }

        String normalized = normalizeProductCategory(value);
        return normalized.equals(TOP_WEAR)
                || normalized.equals(BOTTOM_WEAR)
                || normalized.equals(FOOTWEAR)
                || normalized.equals(ETHNIC_WEAR)
                || normalized.equals(WINTER_WEAR)
                || normalized.equals(ACCESSORIES);
    }

    public static String normalizeSubCategory(String value) {
        return isBlank(value) ? "" : value.trim();
    }

    private static String firstPresent(String... values) {
        if (values == null) {
            return "";
        }

        for (String value : values) {
            if (!isBlank(value)) {
                return value;
            }
        }
        return "";
    }

    private static String resolveProductCategory(String currentCategory, String parentName, String leafName) {
        if (!isBlank(currentCategory)) {
            return currentCategory;
        }
        if (!isBlank(parentName) && parentName.trim().equalsIgnoreCase(FOOTWEAR)) {
            return FOOTWEAR;
        }
        return firstPresent(leafName, parentName);
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
