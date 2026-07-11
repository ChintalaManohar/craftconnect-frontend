import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiHeart,
  FiShoppingCart,
  FiArrowLeft,
  FiPackage,
  FiInfo,
  FiMapPin,
  FiCheck,
  FiLock
} from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";

import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";

import {
  productService,
  reviewService,
  orderService
} from "../services/api";

function ProductDetails({
  user,
  cart,
  wishlist,
  onAddToCart,
  onWishlistToggle,
  onLogout,
}) {

  const { id } = useParams();
  const navigate = useNavigate();

  // Product
  const [product, setProduct] = useState(null);

  const [selectedImage, setSelectedImage] = useState("");

  // Reviews
  const [reviews, setReviews] = useState([]);

  // Recommendations
  const [similarProducts, setSimilarProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review Form
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");

  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Verified Purchase
  const [isVerifiedPurchaser, setIsVerifiedPurchaser] = useState(false);

  // Toast
  const [addedToast, setAddedToast] = useState(false);

  // Load Product
  useEffect(() => {

    const loadProduct = async () => {

      setLoading(true);

      try {

        // ------------------------
        // Product
        // ------------------------

        const productData =
          await productService.getProductById(id);

        setProduct(productData);

        const initialImage =
          productData.images?.length > 0
            ? productData.images[0].imageUrl
            : productData.imageUrl;

        setSelectedImage(initialImage);

        // ------------------------
        // Reviews
        // ------------------------

        try {

          const reviewData =
            await reviewService.getProductReviews(id);

          setReviews(reviewData);

        } catch {

          setReviews([]);

        }

        // ------------------------
        // Similar Products
        // ------------------------

        try {

          const similar =
            await productService.getSimilarProducts(id);

          setSimilarProducts(similar);

        } catch {

          setSimilarProducts([]);

        }

        // ------------------------
        // Recommended Products
        // ------------------------

        try {

          const recommended =
            await productService.getRecommendedProducts(id);

          setRecommendedProducts(recommended);

        } catch {

          setRecommendedProducts([]);

        }

        // ------------------------
        // Check Purchase
        // ------------------------

        if (user) {

          try {

            const orders =
              await orderService.getMyOrders();

            const purchased = orders.some(
              (order) =>
                order.productId === productData.id
            );

            setIsVerifiedPurchaser(purchased);

          } catch {

            setIsVerifiedPurchaser(false);

          }

        }

      } catch (err) {

        console.error(err);

        setError("Unable to load product.");

      } finally {

        setLoading(false);

      }

    };

    loadProduct();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }, [id, user]);



  // Rating Fallback
  const rating = product?.rating ?? 5;

  const productImages =
    product?.images?.length > 0
      ? product.images
      : product?.imageUrl
        ? [
          {
            id: "primary",
            imageUrl: product.imageUrl
          }
        ]
        : [];

  // Cart Count
  const cartCount =
    cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

  // Wishlist Status
  const inWishlist =
    wishlist.includes(product?.id);



  const handleAddToCartWrapper = () => {

    onAddToCart(product);

    setAddedToast(true);

    setTimeout(() => {

      setAddedToast(false);

    }, 2000);

  };



  const handleBuyNow = () => {

    navigate("/checkout", {

      state: {

        product,

        quantity: 1,

      },

    });

  };



  const handleReviewSubmit = async (e) => {

    e.preventDefault();

    if (!commentInput.trim()) {

      setReviewError("Please write a review.");

      return;

    }

    try {

      setSubmittingReview(true);

      const review =
        await reviewService.createReview(id, {

          rating: ratingInput,

          comment: commentInput,

        });

      setReviews((prev) => [...prev, review]);

      setCommentInput("");

      setRatingInput(5);

      setReviewSuccess(true);

    } catch {

      setReviewError("Unable to submit review.");

    } finally {

      setSubmittingReview(false);

    }

  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background-warm pt-16 sm:pt-20">
        <Navbar user={user} cartCount={cart.reduce((a, c) => a + (c.quantity || 1), 0)} wishlistCount={wishlist.length} onLogout={onLogout} />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Skeleton Loader */}
          <div className="animate-pulse space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-gray-200 rounded-3xl h-[450px]"></div>
              <div className="space-y-6">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-background-warm pt-16 sm:pt-20">
        <Navbar user={user} cartCount={cart.reduce((a, c) => a + (c.quantity || 1), 0)} wishlistCount={wishlist.length} onLogout={onLogout} />
        <main className="flex-grow flex flex-col items-center justify-center py-20 px-4">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-md text-center max-w-md w-full">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-500 mb-6">{error || 'The requested product is unavailable.'}</p>
            <Link to="/home" className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full font-semibold shadow-sm transition-all duration-300">
              <FiArrowLeft />
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }



  // Ratings distribution math
  const totalReviews = reviews.length;
  const starDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (starDistribution[r.rating] !== undefined) {
      starDistribution[r.rating]++;
    }
  });

  // Calculate artisan public URL mapping
  const artisanId = product.artisanId;
  // CSS transform classes for Simulated Camerwork gallery


  return (
    <div className="min-h-screen flex flex-col bg-background-warm text-gray-800 font-sans pt-16 sm:pt-20">
      <Navbar
        user={user}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onLogout={onLogout}
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back navigation */}
        <Link to="/home" className="inline-flex items-center space-x-2 text-gray-500 hover:text-primary font-semibold mb-6 transition-colors duration-200">
          <FiArrowLeft className="h-4 w-4" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Product Details Section */}
        {/* ================= PRODUCT DETAILS ================= */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-10 mb-12">

          <div className="grid lg:grid-cols-2 gap-10">

            {/* LEFT : PRODUCT IMAGE */}

            <div className="min-w-0">

              <div className="flex flex-col sm:flex-row gap-4">

                {/* THUMBNAILS */}

                {productImages.length > 1 && (

                  <div
                    className="
          order-2
          sm:order-1
          flex
          sm:flex-col
          gap-3
          overflow-x-auto
          sm:overflow-x-visible
          sm:overflow-y-auto
          pb-2
          sm:pb-0
          sm:max-h-[500px]
          shrink-0
        "
                  >

                    {productImages.map((image, index) => {

                      const isSelected =
                        selectedImage === image.imageUrl;

                      return (

                        <button
                          key={
                            image.id ??
                            image.publicId ??
                            `${image.imageUrl}-${index}`
                          }
                          type="button"
                          onClick={() =>
                            setSelectedImage(image.imageUrl)
                          }
                          className={`
                shrink-0
                w-20
                h-20
                rounded-xl
                overflow-hidden
                border-2
                transition-all
                duration-200

                ${isSelected
                              ? "border-primary shadow-md"
                              : "border-gray-200 hover:border-primary/50"
                            }
              `}
                          aria-label={`View product image ${index + 1}`}
                        >

                          <img
                            src={image.imageUrl}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />

                        </button>

                      );

                    })}

                  </div>

                )}


                {/* MAIN IMAGE */}

                <div
                  className="
        order-1
        sm:order-2
        flex-1
        min-w-0
        rounded-3xl
        overflow-hidden
        border
        border-gray-200
        shadow-sm
        bg-gray-50
      "
                >

                  <img
                    src={selectedImage || product.imageUrl}
                    alt={product.name}
                    className="
          w-full
          h-[350px]
          sm:h-[450px]
          lg:h-[500px]
          object-contain
          transition-opacity
          duration-200
        "
                  />

                </div>

              </div>


              {/* IMAGE COUNTER */}

              {productImages.length > 1 && (

                <p className="mt-3 text-center text-sm text-gray-500">

                  {productImages.findIndex(
                    image => image.imageUrl === selectedImage
                  ) + 1}

                  {" / "}

                  {productImages.length}

                </p>

              )}

            </div>



            {/* RIGHT : PRODUCT INFO */}

            <div className="flex flex-col">

              {/* Category */}

              <span className="w-fit px-4 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs uppercase tracking-wider">

                {product.categoryName}

              </span>


              {/* Product Name */}

              <h1 className="mt-4 text-4xl font-black text-gray-800">

                {product.name}

              </h1>


              {/* Rating */}

              <div className="flex items-center mt-4">

                {[1, 2, 3, 4, 5].map((star) => (

                  <FaStar

                    key={star}

                    className={`mr-1 ${star <= Math.round(rating)
                      ? "text-yellow-500"
                      : "text-gray-300"
                      }`}

                  />

                ))}

                <span className="ml-2 font-semibold">

                  {rating}

                </span>

                <span className="ml-2 text-gray-500">

                  ({reviews.length} Reviews)

                </span>

              </div>


              {/* Price */}

              <div className="mt-6">

                <h2 className="text-4xl font-bold text-primary">

                  ₹{product.price}

                </h2>

              </div>


              {/* Stock */}

              <div className="mt-4">

                {

                  product.quantity > 0 ?

                    <span className="text-green-600 font-semibold">

                      In Stock ({product.quantity})

                    </span>

                    :

                    <span className="text-red-600 font-semibold">

                      Out of Stock

                    </span>

                }

              </div>


              {/* Description */}

              <div className="mt-8">

                <h3 className="font-bold text-lg mb-2">

                  Description

                </h3>

                <p className="text-gray-600 leading-7">

                  {product.description}

                </p>

              </div>



              {/* Artisan */}

              <div className="mt-8 p-4 rounded-2xl bg-gray-50 border">

                <h4 className="font-semibold mb-2">

                  Crafted By

                </h4>

                <Link

                  to={`/artisan/${product.artisanId}`}

                  className="text-primary text-lg font-bold hover:underline"

                >

                  {product.artisanName}

                </Link>

              </div>


              {/* Buttons */}

              <div className="flex gap-4 mt-10">

                <button

                  onClick={handleAddToCartWrapper}

                  className="flex-1 bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-hover transition"

                >

                  <FiShoppingCart className="inline mr-2" />

                  Add To Cart

                </button>


                <button

                  onClick={handleBuyNow}

                  className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition"

                >

                  Buy Now

                </button>


                <button

                  onClick={() => onWishlistToggle(product.id)}

                  className={`w-16 rounded-xl border flex justify-center items-center transition

          ${inWishlist

                      ?

                      "bg-red-50 border-red-300 text-red-500"

                      :

                      "bg-white border-gray-300 text-gray-500"

                    }

          `}

                >

                  {

                    inWishlist ?

                      <FaHeart size={22} />

                      :

                      <FiHeart size={22} />

                  }

                </button>

              </div>


              {/* Delivery */}

              <div className="mt-8 grid md:grid-cols-2 gap-4">

                <div className="p-4 border rounded-xl flex items-center">

                  <FiPackage className="mr-3 text-primary" />

                  Free Delivery

                </div>

                <div className="p-4 border rounded-xl flex items-center">

                  <FiInfo className="mr-3 text-primary" />

                  100% Handmade

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ARTISAN BIOGRAPHY PREVIEW CARD */}
        {/* ================= ARTISAN SECTION ================= */}

        <div className="bg-gradient-to-r from-primary/5 to-secondary/10 rounded-3xl border border-primary/10 p-8 mb-12">

          <div className="flex flex-col md:flex-row gap-6 items-center">

            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">

              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt={product.artisanName}
                className="w-full h-full object-cover"
              />

            </div>

            <div className="flex-1">

              <h2 className="text-2xl font-bold">

                {product.artisanName}

              </h2>

              <p className="text-gray-500 mt-2">

                This handcrafted product is made by one of our verified rural artisans.
                Every purchase directly supports the artisan and helps preserve traditional
                Indian craftsmanship.

              </p>

              <Link

                to={`/artisan/${product.artisanId}`}

                className="inline-flex mt-5 px-5 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition"

              >

                View Artisan Profile

              </Link>

            </div>

          </div>

        </div>



        {/* ================= REVIEWS ================= */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-12">

          <h2 className="text-2xl font-bold mb-8">

            Ratings & Reviews

          </h2>


          {/* Average Rating */}

          <div className="flex items-center mb-8">

            <span className="text-5xl font-bold text-primary">

              {rating}

            </span>

            <div className="ml-5">

              <div className="flex">

                {[1, 2, 3, 4, 5].map((star) => (

                  <FaStar

                    key={star}

                    className={`mr-1 ${star <= Math.round(rating)

                      ?

                      "text-yellow-500"

                      :

                      "text-gray-300"

                      }`}

                  />

                ))}

              </div>

              <p className="text-gray-500 mt-1">

                {reviews.length} Reviews

              </p>

            </div>

          </div>



          {/* Review Form */}

          {

            isVerifiedPurchaser &&

            <form

              onSubmit={handleReviewSubmit}

              className="border rounded-2xl p-6 mb-10"

            >

              <h3 className="font-bold mb-4">

                Write a Review

              </h3>


              <div className="flex mb-5">

                {

                  [1, 2, 3, 4, 5].map((star) => (

                    <button

                      type="button"

                      key={star}

                      onClick={() => setRatingInput(star)}

                      className="mr-2"

                    >

                      <FaStar

                        className={`text-2xl ${star <= ratingInput

                          ?

                          "text-yellow-500"

                          :

                          "text-gray-300"

                          }`}

                      />

                    </button>

                  ))

                }

              </div>


              <textarea

                rows="5"

                value={commentInput}

                onChange={(e) => setCommentInput(e.target.value)}

                placeholder="Share your experience..."

                className="w-full border rounded-xl p-4 mb-5"

              />


              {

                reviewError &&

                <p className="text-red-500 mb-4">

                  {reviewError}

                </p>

              }


              {

                reviewSuccess &&

                <p className="text-green-600 mb-4">

                  Review submitted successfully.

                </p>

              }


              <button

                disabled={submittingReview}

                className="bg-primary text-white px-6 py-3 rounded-xl font-semibold"

              >

                {

                  submittingReview

                    ?

                    "Submitting..."

                    :

                    "Submit Review"

                }

              </button>

            </form>

          }



          {

            !isVerifiedPurchaser &&

            <div className="border rounded-2xl p-6 mb-8 bg-gray-50">

              <div className="flex items-center">

                <FiLock className="mr-3 text-gray-500" />

                <span>

                  Only verified purchasers can submit reviews.

                </span>

              </div>

            </div>

          }



          {/* Reviews List */}

          <div className="space-y-5">

            {

              reviews.length === 0

                ?

                (

                  <div className="text-center text-gray-500 py-8">

                    No reviews yet.

                  </div>

                )

                :

                (

                  reviews.map((review) => (

                    <div

                      key={review.id}

                      className="border rounded-2xl p-5"

                    >

                      <div className="flex justify-between">

                        <div>

                          <h4 className="font-bold">

                            {review.userName}

                          </h4>

                        </div>

                        <div className="flex">

                          {

                            [1, 2, 3, 4, 5].map((star) => (

                              <FaStar

                                key={star}

                                className={`${star <= review.rating

                                  ?

                                  "text-yellow-500"

                                  :

                                  "text-gray-300"

                                  }`}

                              />

                            ))

                          }

                        </div>

                      </div>

                      <p className="mt-3 text-gray-600">

                        {review.comment}

                      </p>

                    </div>

                  ))

                )

            }

          </div>

        </div>

        {/* SIMILAR PRODUCTS SECTION */}
        {/* ================= SIMILAR PRODUCTS ================= */}

        {similarProducts.length > 0 && (

          <section className="mb-14">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold text-gray-800">

                Similar Products

              </h2>

              <Link
                to="/home"
                className="text-primary font-semibold hover:underline"
              >
                View More
              </Link>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {similarProducts
                .filter((p) => p.id !== product.id)
                .slice(0, 4)
                .map((item) => (

                  <ProductCard
                    key={item.id}
                    product={item}
                    inWishlist={wishlist.includes(item.id)}
                    onWishlistToggle={onWishlistToggle}
                    onAddToCart={onAddToCart}
                    isAddedToCart={cart.some(
                      (cartItem) => cartItem.id === item.id
                    )}
                  />

                ))}

            </div>

          </section>

        )}






        {/* ================= RECOMMENDED PRODUCTS ================= */}

        {recommendedProducts.length > 0 && (

          <section className="mb-8">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold text-gray-800">

                Recommended For You

              </h2>

              <Link
                to="/home"
                className="text-primary font-semibold hover:underline"
              >
                Explore More
              </Link>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {recommendedProducts
                .filter((p) => p.id !== product.id)
                .slice(0, 4)
                .map((item) => (

                  <ProductCard
                    key={item.id}
                    product={item}
                    inWishlist={wishlist.includes(item.id)}
                    onWishlistToggle={onWishlistToggle}
                    onAddToCart={onAddToCart}
                    isAddedToCart={cart.some(
                      (cartItem) => cartItem.id === item.id
                    )}
                  />

                ))}

            </div>

          </section>

        )}

      </main>

      {/* ================= ADD TO CART TOAST ================= */}

      {addedToast && (

        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-bounce">

          <FiCheck className="text-xl" />

          <span className="font-semibold">

            Product added to cart

          </span>

        </div>

      )}
      <Footer />
    </div>
  );
}

export default ProductDetails;
