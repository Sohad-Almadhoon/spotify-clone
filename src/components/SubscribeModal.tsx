"use client";

import { useState } from "react";

import { toast } from "react-hot-toast";

import { postData } from "@/src/libs/helpers";
import { getStripe } from "@/src/libs/stripeClient";

import { useUser } from "@/src/hooks/useUser";

import { Price, ProductWithPrice } from "@/types";

import { Modal } from "./Modal";
import Button from "./Button";
import { useSubscribeModal } from "@/src/hooks/useSubscribeModal";

interface subscribeModalProps {
  products: ProductWithPrice[];
}

const formatPrice = (price: Price) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: 0,
  }).format((price?.unit_amount || 0) / 100);
};

const SubscribeModal: React.FC<subscribeModalProps> = ({ products }) => {
  const subscribeModal = useSubscribeModal();
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const { user, isLoading, subscription } = useUser();

  const onChange = (open: boolean) => {
    if (!open) {
      subscribeModal.onClose();
    }
  };

  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return toast.error("Must be logged in to subscribe");
    }

    if (subscription) {
      setPriceIdLoading(undefined);
      return toast("You are already subscribed");
    }

    try {
      const { sessionId } = await postData({
        url: "/api/create-checkout-session",
        data: { price },
      });
      console.log("Session", sessionId)
      const stripe = await getStripe();
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error("Error redirecting to Checkout:", error.message);
        }
      }
    } catch (error) {
      toast.error((error as Error)?.message);
    } finally {
      setPriceIdLoading(undefined);
    }
  };

  let content = <div className="text-center">No products avaliable</div>;

  if (products.length) {
    content = (
      <div>
        {products.map((product) => {
          if (!product.prices?.length) {
            return <div key={product.id}>No prices avaliable</div>;
          }

          return product.prices.map((price) => (
            <Button
              onClick={() => handleCheckout(price)}
              disabled={isLoading || price.id === priceIdLoading}
              className="mb-4"
              key={price.id}>{`Subscribe for ${formatPrice(price)} a ${
              price.interval
            }`}</Button>
          ));
        })}
      </div>
    );
  }

  if (subscription) {
    content = <div className="text-center">Already subscribed!</div>;
  }

  return (
    <Modal
      title="Only for premium users"
      description="Listen to music with Spotify Premium"
      isOpen={subscribeModal.isOpen}
      onChange={onChange}>
      {content}
    </Modal>
  );
};

export default SubscribeModal;
