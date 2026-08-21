import sys
import os
import numpy as np
from scipy.stats import spearmanr
import time

# Add backend to path so we can import app
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.risk.ml_triage import ml_triage_model

def verify_phase4():
    print("1. Training the ML Surrogate Model...")
    t0 = time.time()
    # Train with 2,000 samples for reasonable speed in test
    ml_triage_model.train(n_samples=2000)
    t1 = time.time()
    print(f"Training finished in {t1 - t0:.2f} seconds.\n")
    
    print("2. Generating a held-out test set (500 samples)...")
    X_test, y_test_log10 = ml_triage_model.generate_synthetic_data(n_samples=500)
    true_pc = 10 ** y_test_log10
    
    print("\n3. Predicting Pc using the surrogate model...")
    t2 = time.time()
    pred_pc = ml_triage_model.predict_pc(X_test)
    t3 = time.time()
    print(f"Predictions generated in {t3 - t2:.4f} seconds.")
    
    print("\n4. Calculating Spearman Rank Correlation...")
    # Spearman rank correlation compares how well the model preserves the true ordering
    # rather than just the exact linear values.
    corr, p_value = spearmanr(true_pc, pred_pc)
    
    print(f"Spearman Correlation: {corr:.4f}")
    if corr > 0.90:
        print("[SUCCESS] The surrogate model ranks conjunctions highly accurately (Correlation > 0.90)!")
    else:
        print("[WARNING] The correlation is lower than expected.")
        
if __name__ == "__main__":
    verify_phase4()
