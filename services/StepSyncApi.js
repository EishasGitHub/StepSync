// services/stepSyncApi.js
const API_BASE_URL = 'https://stepsync-api-v2-production.up.railway.app';

class StepSyncApiService {
  /**
   * Get difficulty recommendation based on user data
   * @param {Object} userData - User data containing age, BMI, resting BPM, workout frequency
   * @returns {Promise<Object>} - Prediction result with reconstruction_error and predicted_class
   */
  async getPrediction(userData) {
    try {
      const { age, bmi, restingBPM, workoutFrequency } = userData;
      
      const requestData = {
        features: [age, bmi, restingBPM, workoutFrequency]
      };

      console.log('Sending request to API:', requestData);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API response:', result);
      return result;
    } catch (error) {
      console.error('Error getting prediction:', error);
      throw error;
    }
  }

  /**
   * Check if API is running
   * @returns {Promise<boolean>} - True if API is running
   */
  async checkApiStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      const result = await response.json();
      console.log('API status:', result);
      return result.message === "StepSync API is running";
    } catch (error) {
      console.error('API status check failed:', error);
      return false;
    }
  }

  /**
   * Get game difficulty recommendation
   * @param {Object} userData - User data
   * @returns {Promise<string>} - Recommended difficulty level
   */
  async getRecommendedDifficulty(userData) {
    try {
      const prediction = await this.getPrediction(userData);
      return prediction.predicted_class.toLowerCase(); // Returns 'easy', 'medium', or 'hard'
    } catch (error) {
      console.error('Error getting recommendation:', error);
      // Return default recommendation if API fails
      return 'easy';
    }
  }

  /**
   * Test API with sample data
   * @returns {Promise<Object>} - Test result
   */
  async testApi() {
    try {
      const testData = {
        age: 25,
        bmi: 80.2,
        restingBPM: 70,
        workoutFrequency: 3
      };
      
      const result = await this.getPrediction(testData);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new StepSyncApiService();