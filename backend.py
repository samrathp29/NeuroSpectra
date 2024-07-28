from flask import Flask, request, jsonify
import numpy as np
from scipy import signal
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_eeg():
    data = request.json['eegData']
    # Process the EEG data (e.g., convert to numpy array)
    eeg_array = np.array(data)
    
    # Perform frequency analysis (e.g., using FFT)
    frequencies, power_spectrum = signal.welch(eeg_array, fs=250, nperseg=1024)
    
    # Extract different brainwave bands
    delta = np.mean(power_spectrum[(frequencies >= 0.5) & (frequencies <= 4)])
    theta = np.mean(power_spectrum[(frequencies >= 4) & (frequencies <= 8)])
    alpha = np.mean(power_spectrum[(frequencies >= 8) & (frequencies <= 13)])
    beta = np.mean(power_spectrum[(frequencies >= 13) & (frequencies <= 30)])
    gamma = np.mean(power_spectrum[(frequencies >= 30) & (frequencies <= 100)])
    
    return jsonify({
        'rawData': eeg_array.tolist(),
        'frequencies': frequencies.tolist(),
        'powerSpectrum': power_spectrum.tolist(),
        'brainwaves': {
            'delta': delta,
            'theta': theta,
            'alpha': alpha,
            'beta': beta,
            'gamma': gamma
        }
    })

if __name__ == '__main__':
    app.run(debug=True)
