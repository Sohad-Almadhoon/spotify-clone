import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

// Use the correct environment variables for secrets
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20",
});

export async function POST(request: NextRequest) {
  // Read the raw body text and the Stripe signature from the headers
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  // Ensure the signature is present, if not return an error response
  if (!signature) {
    return NextResponse.json(
      { message: "Signature missing" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  // Try to construct the event, which verifies the signature and parses the webhook payload
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { message: "Webhook Error: " + err.message },
      { status: 400 }
    );
  }

  // Handle checkout session completed event
  if (event.type === "checkout.session.completed") {
    try {
      const session = event.data.object as Stripe.Checkout.Session;

      // Retrieve the session to get line items with expansion
      const sessionLineItems = await stripe.checkout.sessions.retrieve(
        session.id,
        {
          expand: ["line_items"],
        }
      );

      const lineItems = sessionLineItems.line_items?.data;

      // If line items are missing, return a 500 error
      if (!lineItems) {
        return NextResponse.json(
          { message: "Internal Server Error: Missing line items." },
          { status: 500 }
        );
      }

      // Log and return the line items in the response
      console.log("Line Items:", lineItems);
      return NextResponse.json(
        { message: "Checkout session completed successfully", lineItems },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error retrieving line items:", error.message);
      return NextResponse.json(
        { message: "Order Not Saved: " + error.message },
        { status: 500 }
      );
    }
  }

  // Handle unrecognized events (log them and return 200)
  console.log(`Unhandled event type: ${event.type}`);
  return NextResponse.json(
    { message: `Event ${event.type} received but not handled.` },
    { status: 200 } // Return 200 for unhandled events
  );
}
