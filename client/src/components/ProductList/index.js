import React, {useEffect} from 'react';
import { useQuery } from '@apollo/client';
import { useStoreContext } from '../../utils/GlobalState';
import { UPDATE_PRODUCTS } from '../../utils/actions';
import ProductItem from '../ProductItem';
import { QUERY_PRODUCTS } from '../../utils/queries';
import spinner from '../../assets/spinner.gif';
import { idbPromise} from '../../utils/helpers';  

function ProductList() {
  // retrieve current state and dispatch method to update the state
  const [state, dispatch] = useStoreContext();
  //destructure currentCategory from state
  const { currentCategory } = state;
  //query products and save as data object
  const { loading, data } = useQuery(QUERY_PRODUCTS);
  
  useEffect(() => {
    //if theres data to be stored 
    if (data) {
      //lets store it in the global state object
      dispatch({
        type: UPDATE_PRODUCTS,
        products: data.products
      });
      //save it to indexeddb
      data.products.forEach(product => {
        idbPromise('products', 'put', product);
      });
    } else if (!loading) {
      // since we're offline, get all of the data from the `products` store
      idbPromise('products', 'get').then(products => {
        // use retrieved data to set global state for offline browsing
        dispatch({
          type: UPDATE_PRODUCTS,
          products: products
        });
      });
    }
  }, [data, loading, dispatch]);

  //filter products based on category 
  function filterProducts() {
    if (!currentCategory) {
      return state.products;
    }
    
    return state.products.filter(product => product.category._id === currentCategory);
  }


  return (
    <div className="my-2">
      <h2>Our Products:</h2>
      {state.products.length ? (
        <div className="flex-row">
          {filterProducts().map((product) => (
            <ProductItem
              key={product._id}
              _id={product._id}
              image={product.image}
              name={product.name}
              price={product.price}
              quantity={product.quantity}
            />
          ))}
        </div>
      ) : (
        <h3>You haven't added any products yet!</h3>
      )}
      {loading ? <img src={spinner} alt="loading" /> : null}
    </div>
  );
}

export default ProductList;
