//
//  ReactBridge.swift
//  PaperlessPost
//
//  Created by Sal Randazzo on 1/8/18.
//  Copyright © 2018 PaperlessPost. All rights reserved.
//

import Foundation

class ReactBridge: NSObject {
    @objc static let shared = ReactBridge()
    
    @objc public lazy var bridge: RCTBridge = {
        guard let bridge = RCTBridge(delegate: self, launchOptions: nil) else {
            fatalError("Unable to instantiate RCTBridge")
        }
        return bridge
    }()
}

extension ReactBridge: RCTBridgeDelegate {
    
    func sourceURL(for bridge: RCTBridge!) -> URL! {
      return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource: nil)
    }
    
    func viewForModule(_ moduleName: String, initialProperties: [String : Any]?) -> RCTRootView {
        return RCTRootView(bridge: self.bridge, moduleName: moduleName, initialProperties: initialProperties)
    }
}
