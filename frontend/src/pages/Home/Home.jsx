import React, { useState, useContext } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'
import RecommendationsCarousel from '../../components/Food/RecommendationsCarousel'
import { StoreContext } from '../../context/StoreContext'

const Home = () => {
  const [category, setCategory] = useState("All");
  const { token } = useContext(StoreContext);

  return (
    <div>
      <Header />

      {/* Trending Items */}
      <RecommendationsCarousel type="trending" />

      {/* Time-based Suggestions */}
      <RecommendationsCarousel type="time-based" />

      {/* Personalized Recommendations (if logged in) */}
      {token && <RecommendationsCarousel type="personalized" />}

      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} />
      <AppDownload />
    </div>
  )
}

export default Home

