# homebridge-openwebif-switch

Can switch tv receivers (like dreambox or vusolo2) which run openwebif as web interface.

HomeBridge: https://github.com/nfarina/homebridge

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install homebridge-openwebif-switch using: npm install -g git+https://github.com/alex224/homebridge-openwebif-switch
3. Update your configuration file. See sample-config.json in this repository for a sample. 

# Configuration

 <pre>
"accessories": [
        {
            "accessory": "OpenWebifSwitch",
            "name": "Receiver Standby",
            "host": "vusolo2",
            <i>"port": 80,</i>
            <i>"checkIntervalSeconds": 120</i>
        }
    ]
</pre>
optional settings written in italic font
