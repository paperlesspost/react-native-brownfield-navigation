//
//  ReactViewController.swift
//  PaperlessPost
//
//  Created by Sal Randazzo on 1/22/18.
//  Copyright © 2018 PaperlessPost. All rights reserved.
//

import UIKit

@objc(ReactViewController)
class ReactViewController: UIViewController {
    
    private let moduleName: String
    let reactView: RCTRootView
    let initialProps:[String : Any]?
    
    @objc var reactTag: NSNumber {
        return reactView.reactTag
    }
    
    @objc init(moduleName: String, initialProperties: [String : Any]? = nil) {
        self.moduleName = moduleName
        self.reactView = ReactBridge.shared.viewForModule(moduleName, initialProperties: initialProperties)
        self.initialProps = initialProperties
        super.init(nibName: nil, bundle: nil)
        reactView.setReactViewController(self)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        NavigationEventEmitter.globalNavigation()?.publishScreenChangeEvent(.viewWillAppear, rootTag: self.reactTag)
        // Natively handle hiding showing nav bar so it is immediate.
        if let navBarProps = self.initialProps?["navigationBar"] as? [String: Any], let hidden = navBarProps["hidden"] as? Bool {
            let animated = navBarProps["animated"] as? Bool ?? false
            self.navigationController?.setNavigationBarHidden(hidden, animated: animated)
        }
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        NavigationEventEmitter.globalNavigation()?.publishScreenChangeEvent(.viewDidAppear, rootTag: self.reactTag)
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        NavigationEventEmitter.globalNavigation()?.publishScreenChangeEvent(.viewWillDisappear, rootTag: self.reactTag)
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        NavigationEventEmitter.globalNavigation()?.publishScreenChangeEvent(.viewDidDisappear, rootTag: self.reactTag)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        view.backgroundColor = .white
        
        view.addSubview(reactView)
        
        reactView.translatesAutoresizingMaskIntoConstraints = false
        reactView.topAnchor.constraint(equalTo: topLayoutGuide.bottomAnchor).isActive = true
        reactView.leadingAnchor.constraint(equalTo: view.leadingAnchor).isActive = true
        reactView.trailingAnchor.constraint(equalTo: view.trailingAnchor).isActive = true
        reactView.bottomAnchor.constraint(equalTo: bottomLayoutGuide.topAnchor).isActive = true
    }
}
