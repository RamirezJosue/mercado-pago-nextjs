import Head from 'next/head';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type ShoppingCartState = {
  quantity: number;
  description: string;
  price: number;
  preferenceId?: string;
}

const createCheckoutButton = (preference?: string) => {
  const script = document.createElement('script');
  script.src = 'https://www.mercadopago.com.pe/integrations/v1/web-payment-checkout.js';
  script.type = 'text/javascript';
  script.dataset.preferenceId = preference;
  const btnCheckout = document.getElementById('button-checkout');
  if (btnCheckout) {
    btnCheckout.innerHTML = '';
    btnCheckout.appendChild(script);
  }
}

const CheckoutButton: FC<{ preference?: string }> = ({ preference }) => {
  useEffect(() => {
    if (preference) {
      createCheckoutButton(preference);
    }

    return () => {
      const btnCheckout = document.getElementById('button-checkout');
      btnCheckout?.firstChild && btnCheckout?.removeChild(btnCheckout?.firstChild);
    }
  }, [preference])

  return <div id='button-checkout' />;
}

export default function Home() {
  const [state, setState] = useState<ShoppingCartState>({
    quantity: 1,
    description: 'Some book',
    price: 10,
  });

  const { amount, summaryPrice, summaryQuantity, summaryTotal } = useMemo(() => {
    const amount = (state?.price || 10) * (state?.quantity || 1);
    return {
      amount,
      summaryPrice: `$ ${state?.price || 10}`,
      summaryQuantity: state?.quantity || 1,
      summaryTotal: `$ ${amount}`,
    }
  }, [state]);

  const checkoutBtnRef = useRef<HTMLButtonElement>(null);

  const handleQuantityOnChange = useCallback(
    (event: any) =>
      setState((state) => ({
        ...state,
        quantity: parseInt(event?.target?.value || '0', 10),
      })),
    []
  );

  const handleOnCheckout = async () => {
    checkoutBtnRef.current?.toggleAttribute('disabled', true);
    try {
      const result = await fetch('/api/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state),
      });

      const response = await result.json();
      console.log(response.id);
      setState((state) => ({ ...state, preferenceId: response.id }));
    } catch (error) {
      alert(JSON.stringify(error || 'Unexpected error'));
      checkoutBtnRef.current?.toggleAttribute('disabled', false);
    }
  }

  return (
    <>
      <Head>
        <title>Pasarela de pago - Mercado pago pro</title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>
      <main>
        <section>
          <div className="container">
            <div className='block-heading'>
              <h2>Carrito de compra</h2>
              <p>
                Este es un ejemplo de integración de Checkout Pro de Mercado Pago
              </p>
            </div>
            <div className="content">
              <div className="row">
                <div className="col-md-12 col-lg-8">
                  <div className='items'>
                    <div className="product">
                      <div className="info">
                        <div className="product-details">
                          <div className="row justify-content-md-center">
                            <div className="col-md-3">
                              <img
                                src="/images/product.png"
                                alt="products"
                                className="img-fluid mx-auto d-block image"
                              />
                            </div>
                            <div className="col-md-4 product-detail">
                              <h4>Producto</h4>
                              <div className="product-info">
                                <p>
                                  <b>Descripción: </b>
                                  <span id='product-description'>
                                    {state.description}
                                  </span>
                                  <br />
                                  <b>Autor: </b> Josue Ramirez
                                  <br />
                                  <b>Número de páginas: </b>336
                                  <br />
                                  <b>Precio:</b> ${' '}
                                  <span id='unit-price'>{state.price}</span>
                                </p>
                              </div>
                            </div>
                            <div className="col-md-3 product-detail">
                              <label htmlFor='quantity'>
                                <h5>Cantidad</h5>
                              </label>
                              <input
                                type='number'
                                id='quantity'
                                value={state.quantity}
                                className='form-control'
                                onChange={handleQuantityOnChange}
                                min={0}
                                max={10}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-12 col-lg-4">
                  <div className="summary">
                    <h3>Carrito</h3>
                    <div className="summary-item">
                      <span className='text'>Sub total </span>
                      <span className='price' id='cart-total'>
                        $ {amount}
                      </span>
                    </div>
                    {
                      !state?.preferenceId ? 
                      <>
                        <button
                          className='btn btn-primary btn-lg btn-block'
                          id='checkout-btn'
                          onClick={handleOnCheckout}
                          ref={checkoutBtnRef}
                        >
                          Verificar
                        </button>
                      </>
                      : <CheckoutButton preference={state?.preferenceId} />
                    }
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
